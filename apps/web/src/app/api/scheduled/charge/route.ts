
import { NextResponse } from "next/server";
import Stripe from "stripe";
import dayjs from "dayjs";
import { getPendingBookingsToCharge, updateBooking } from "@/lib/api/bookings-store";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const today = dayjs().format("YYYY-MM-DD");
  // const today = "2025-07-31"; // ✅ 临时设定为测试订单的扣费日期
  
  // ✅ Log 当天日期和即将处理的订单数
  console.log(`📅 Running charge script for ${today}`);

  const pendingBookings = await getPendingBookingsToCharge(today);
  console.log(`📦 Found ${pendingBookings.length} pending bookings to charge`);

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
        amount: totalPrice,
        currency: "jpy",
        customer: stripeCustomerId,
        payment_method: stripePaymentMethodId,
        off_session: true,
        confirm: true,
      });

      await updateBooking(id, {
        status: "paid",
        paymentIntentId: paymentIntent.id,
      });
      // ✅ Log 成功信息
      console.log(`✅ Charged booking ${id}, intent: ${paymentIntent.id}`);

      results.push({ id, success: true });
    } catch (err: any) {
      await updateBooking(id, { status: "failed" });

      // ❗取消 Beds24 订单
      if (beds24BookId) {
        try {
          await fetch("https://api.beds24.com/json/setBooking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authentication: {
                apiKey: process.env.BEDS24_API_KEY,
              },
              bookings: [
                {
                  bookingId: beds24BookId,
                  status: "cancelled",
                },
              ],
            }),
          });
        } catch (e) {
          console.error("Beds24 cancellation failed", e);
        }
      }
      // ❌ Log 失败信息
      console.error(`❌ Charge failed for booking ${id}:`, err?.message || err);

      results.push({ id, success: false, error: err.message });
    }
  }

  return NextResponse.json({ ok: true, results });
}
