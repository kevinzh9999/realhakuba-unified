// app/api/admin/reconcile/route.ts
import { NextResponse } from "next/server";
import { getAllBookings, updateBookingStatus } from "@/lib/api/bookings-store";
import Stripe from "stripe";
import dayjs from "dayjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    // 1. 获取所有状态为 pending 的订单（这些应该已经有 paymentIntentId）
    const allBookings = await getAllBookings();
    const pendingBookings = allBookings.filter(
      booking => booking.status === 'pending' && booking.paymentIntentId
    );
    
    const results = {
      checked: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const booking of pendingBookings) {
      results.checked++;
      
      try {
        // 2. 从 Stripe 获取 PaymentIntent 状态
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.paymentIntentId!
        );
        
        // 3. 比较 Stripe 状态和数据库状态
        if (paymentIntent.status === 'succeeded' && booking.status !== 'paid') {
          // Stripe 显示已支付，但数据库还是 pending
          await updateBookingStatus(booking.id, 'paid');
          
          results.updated++;
          results.details.push({
            bookingId: booking.id,
            guestName: booking.guestName,
            action: 'updated_to_paid',
            stripeStatus: paymentIntent.status,
            amount: paymentIntent.amount / 100
          });
          
        } else if (paymentIntent.status === 'canceled' && booking.status === 'pending') {
          // Stripe 显示已取消
          await updateBookingStatus(booking.id, 'cancelled');
          
          results.updated++;
          results.details.push({
            bookingId: booking.id,
            guestName: booking.guestName,
            action: 'updated_to_cancelled',
            stripeStatus: paymentIntent.status
          });
          
        } else if (paymentIntent.status === 'requires_payment_method' && 
                   booking.status === 'pending' &&
                   dayjs().isAfter(dayjs(booking.chargeDate))) {
          // 支付失败且已过扣款日期
          await updateBookingStatus(booking.id, 'failed');
          
          results.updated++;
          results.details.push({
            bookingId: booking.id,
            guestName: booking.guestName,
            action: 'updated_to_failed',
            stripeStatus: paymentIntent.status,
            reason: 'payment_method_failed'
          });
        }
        
      } catch (error: any) {
        results.errors++;
        results.details.push({
          bookingId: booking.id,
          guestName: booking.guestName,
          action: 'error',
          error: error.message
        });
      }
    }
    
    // 4. 检查 request 状态的订单（软启动后的新订单）
    const requestBookings = allBookings.filter(
      booking => booking.status === 'request' && 
                 booking.approvedForCharge && 
                 booking.manualReviewStatus === 'approved'
    );
    
    for (const booking of requestBookings) {
      results.checked++;
      
      // 如果是立即扣款类型且已审核通过，可以提醒需要手动处理
      if (booking.chargeMethod === 'immediate') {
        results.details.push({
          bookingId: booking.id,
          guestName: booking.guestName,
          action: 'needs_manual_charge',
          message: '已审核通过，需要手动扣款'
        });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      summary: {
        checked: results.checked,
        updated: results.updated,
        errors: results.errors
      },
      details: results.details,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Reconcile error:', error);
    return NextResponse.json(
      { error: 'Reconciliation failed', details: error.message },
      { status: 500 }
    );
  }
}