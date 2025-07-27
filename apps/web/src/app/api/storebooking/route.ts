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
      status,                     // "paid" or "pending" - 前端决定传入
      stripeCustomerId,
      stripePaymentMethodId,
      stripePaymentIntentId,
      beds24BookId,
      chargeDate,             // 必传。若 status === "pending"，应为入住前30天；否则为下单当日
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
      !chargeDate
    ) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const booking: Booking = {
      id: uuidv4(),
      propName,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      totalPrice,
      status, // "pending" or "paid"
      stripeCustomerId,
      stripePaymentMethodId,
      paymentIntentId: stripePaymentIntentId || null,
      beds24BookId: beds24BookId || null,
      createdAt: dayjs().format("YYYY-MM-DD"),
      chargeDate,
    };

    await addBooking(booking);

    return new Response(JSON.stringify({ ok: true, bookingId: booking.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}