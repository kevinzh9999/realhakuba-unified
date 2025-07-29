//storebooking/route.ts

import { NextRequest } from "next/server";
import { addBooking, Booking } from "@/lib/api/bookings-store";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

export async function POST(req: NextRequest) {
  try {
    const {
      propName,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      totalPrice,
      status,                     // "request"
      stripeCustomerId,
      stripePaymentMethodId,
      stripePaymentIntentId,
      beds24BookId,
      chargeDate,             // 必传。若 status === "pending"，应为入住前30天；否则为下单当日
      approved_for_charge = false,
      manual_review_status = "pending",
      charge_method,
    } = await req.json();

    if (
      !propName ||
      !guestName ||
      !guestEmail ||
      !checkIn ||
      !checkOut ||
      !totalPrice ||
      !status ||
      !stripeCustomerId ||
      !stripePaymentMethodId ||
      !chargeDate ||
      !charge_method
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: {
            propName: !propName,
            guestName: !guestName,
            guestEmail: !guestEmail,
            checkIn: !checkIn,
            checkOut: !checkOut,
            totalPrice: !totalPrice,
            status: !status,
            stripeCustomerId: !stripeCustomerId,
            stripePaymentMethodId: !stripePaymentMethodId,
            chargeDate: !chargeDate,
            charge_method: !charge_method
          }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // 验证 charge_method 的值
    if (!['immediate', 'scheduled'].includes(charge_method)) {
      return new Response(
        JSON.stringify({ error: "Invalid charge_method. Must be 'immediate' or 'scheduled'" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 验证 status 的值
    if (!['request', 'pending', 'paid', 'cancelled', 'failed'].includes(status)) {
      return new Response(
        JSON.stringify({ error: "Invalid status" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const booking: Booking = {
      id: uuidv4(),
      propName,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      totalPrice,
      status,
      stripeCustomerId,
      stripePaymentMethodId,
      createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"), // 添加时间
      chargeDate,
      approved_for_charge,
      manual_review_status,
      charge_method,
      // 使用条件扩展，避免 undefined 字段
      ...(stripePaymentIntentId && { paymentIntentId: stripePaymentIntentId }),
      ...(beds24BookId && { beds24BookId: beds24BookId }),
    };

    await addBooking(booking);

    console.log(`📝 New booking created: ${booking.id} for ${guestName}`);

    return new Response(
      JSON.stringify({
        ok: true,
        bookingId: booking.id,
        message: "Booking request submitted successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error('❌ Error storing booking:', err);

    return new Response(
      JSON.stringify({
        error: "Failed to create booking",
        details: err.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}




