// scheduled/charge/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import dayjs from "dayjs";
import { getPendingBookingsToCharge, updateBooking } from "@/lib/api/bookings-store";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {

  const today = dayjs().format("YYYY-MM-DD");
  console.log(`📅 Running charge script for ${today}`);

  // 先执行对账
  await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/reconcile`);

  // 获取已审核通过的待扣款订单
  const pendingBookings = await getPendingBookingsToCharge(today);
  console.log(`📦 Found ${pendingBookings.length} approved bookings to charge`);

  const results: any[] = [];

  for (const booking of pendingBookings) {
    const {
      id,
      totalPrice,
      stripeCustomerId,
      stripePaymentMethodId,
      beds24BookId,
    } = booking;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100, // 转换为分
        currency: "aud", // 或者使用 JPY
        customer: stripeCustomerId,
        payment_method: stripePaymentMethodId,
        off_session: true,
        confirm: true,
        description: `Booking #${beds24BookId || id}`,
        metadata: {
          bookingId: id,
          beds24BookId: beds24BookId || '',
        }
      });

      // 更新订单状态为已支付
      await updateBooking(id, {
        status: "paid",
        paymentIntentId: paymentIntent.id,
        paidAt: new Date().toISOString()     // snake_case
      });

      // 更新 Beds24 状态为 confirmed
      if (beds24BookId) {
        try {
          await fetch("https://api.beds24.com/json/setBooking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authentication: {
                apiKey: process.env.BEDS24_API_KEY,
                propKey: process.env.BEDS24_PROP_KEY,
              },
              bookId: beds24BookId,
              status: "1", // 1 = Confirmed
            }),
          });
          console.log(`✅ Updated Beds24 booking ${beds24BookId} to confirmed`);
        } catch (e) {
          console.error("Beds24 status update failed", e);
        }
      }

      console.log(`✅ Charged booking ${id}, intent: ${paymentIntent.id}`);
      results.push({ id, success: true });

    } catch (err: any) {
      // 支付失败，更新状态
      await updateBooking(id, { status: "failed" });

      // 取消 Beds24 订单
      if (beds24BookId) {
        try {
          await fetch("https://api.beds24.com/json/setBooking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authentication: {
                apiKey: process.env.BEDS24_API_KEY,
                propKey: process.env.BEDS24_PROP_KEY,
              },
              bookId: beds24BookId,
              status: "0", // 0 = Cancelled
            }),
          });
        } catch (e) {
          console.error("Beds24 cancellation failed", e);
        }
      }

      console.error(`❌ Charge failed for booking ${id}:`, err?.message || err);
      results.push({ id, success: false, error: err.message });
    }
  }

  return NextResponse.json({ ok: true, results });
}