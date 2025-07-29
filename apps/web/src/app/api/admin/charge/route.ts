// apps/web/src/app/api/admin/charge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getBookingById, updateBookingStatus } from '@/lib/api/bookings-store';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { bookingId } = await request.json();

        // 1. 获取订单信息
        const booking = await getBookingById(bookingId);
        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // 2. 验证订单状态
        if (booking.status === 'paid') {
            return NextResponse.json(
                { error: 'Booking already paid' },
                { status: 400 }
            );
        }

        if (!booking.approvedForCharge) {
            return NextResponse.json(
                { error: 'Booking not approved for charge' },
                { status: 400 }
            );
        }

        console.log(`[CHARGE] Attempting to charge booking ${bookingId} for ¥${booking.totalPrice}`);

        // 🆕 3. 检查是否已有 PaymentIntent
        if (booking.paymentIntentId) {
            try {
                console.log(`[CHARGE] Checking existing PaymentIntent: ${booking.paymentIntentId}`);
                const existingIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
                
                if (existingIntent.status === 'succeeded') {
                    // 支付已成功，只需更新数据库
                    console.log(`[CHARGE] Payment already succeeded for ${booking.paymentIntentId}`);
                    
                    await updateBookingStatus(booking.id, 'paid', {
                        paidAt: new Date().toISOString()
                    });

                    // 更新 Beds24 状态
                    if (booking.beds24BookId) {
                        try {
                            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/beds24/updatestatus`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    bookId: booking.beds24BookId,
                                    status: "1",
                                    propName: booking.propName
                                })
                            });
                            console.log(`[CHARGE] Updated Beds24 booking ${booking.beds24BookId} to confirmed`);
                        } catch (error) {
                            console.error('[CHARGE] Failed to update Beds24 status:', error);
                        }
                    }
                    
                    return NextResponse.json({
                        success: true,
                        message: 'Payment already completed',
                        paymentIntentId: existingIntent.id,
                        status: 'succeeded',
                        amount: existingIntent.amount
                    });
                } else if (existingIntent.status === 'processing') {
                    // 支付正在处理中
                    return NextResponse.json({
                        success: false,
                        error: 'Payment is currently processing. Please wait.',
                        status: 'processing'
                    });
                } else if (existingIntent.status === 'canceled') {
                    // 之前的支付被取消了，继续创建新的
                    console.log(`[CHARGE] Previous payment was canceled, creating new intent`);
                }
                // 其他状态（requires_payment_method 等）继续创建新的 PaymentIntent
            } catch (error) {
                // 如果 PaymentIntent 无效或不存在，继续创建新的
                console.log(`[CHARGE] Could not retrieve PaymentIntent ${booking.paymentIntentId}:`, error);
            }
        }

        // 4. 创建并确认 PaymentIntent（添加幂等键）
        try {
            // 🆕 生成幂等键，防止网络重试导致的重复扣款
            const idempotencyKey = `charge_${booking.id}_${Date.now()}`;
            
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(booking.totalPrice),
                currency: 'jpy',
                customer: booking.stripeCustomerId,
                payment_method: booking.stripePaymentMethodId,
                off_session: true,
                confirm: true,
                description: `Booking #${booking.beds24BookId || booking.id} - ${booking.guestName}`,
                metadata: {
                    bookingId: booking.id,
                    beds24BookId: booking.beds24BookId || '',
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut,
                    guestName: booking.guestName,
                    guestEmail: booking.guestEmail
                },
                payment_method_options: {
                    card: {
                        request_three_d_secure: 'automatic'
                    }
                }
            }, {
                idempotencyKey: idempotencyKey  // 🆕 添加幂等键
            });

            // 5. 根据支付结果更新订单状态
            if (paymentIntent.status === 'succeeded') {
                await updateBookingStatus(booking.id, 'paid', {
                    paymentIntentId: paymentIntent.id,
                    paidAt: new Date().toISOString()
                });

                // 更新 Beds24 状态为 confirmed
                if (booking.beds24BookId) {
                    try {
                        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/beds24/updatestatus`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                bookId: booking.beds24BookId,
                                status: "1",
                                propName: booking.propName
                            })
                        });
                        console.log(`[CHARGE] Updated Beds24 booking ${booking.beds24BookId} to confirmed`);
                    } catch (error) {
                        console.error('[CHARGE] Failed to update Beds24 status:', error);
                    }
                }

                console.log(`[CHARGE] Success: ${paymentIntent.id} - ¥${booking.totalPrice}`);

                return NextResponse.json({
                    success: true,
                    paymentIntentId: paymentIntent.id,
                    status: 'succeeded',
                    amount: booking.totalPrice
                });
            } else if (paymentIntent.status === 'requires_action') {
                // 需要额外验证（如 3D Secure）
                console.log(`[CHARGE] Requires action for booking ${bookingId}`);

                return NextResponse.json({
                    success: false,
                    requiresAction: true,
                    clientSecret: paymentIntent.client_secret,
                    status: 'requires_action'
                });
            } else {
                // 其他状态
                console.log(`[CHARGE] Unexpected status: ${paymentIntent.status}`);

                return NextResponse.json({
                    success: false,
                    status: paymentIntent.status,
                    error: 'Payment not completed'
                });
            }
        } catch (stripeError: any) {
            console.error('[CHARGE] Stripe error:', stripeError);

            let errorMessage = 'Payment failed';
            if (stripeError.type === 'StripeCardError') {
                errorMessage = stripeError.message;
            } else if (stripeError.type === 'StripeInvalidRequestError') {
                errorMessage = 'Invalid payment request';
            }

            return NextResponse.json(
                {
                    error: errorMessage,
                    details: stripeError.message
                },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('[CHARGE] API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}