import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    guestName,
    guestEmail,
    totalPrice,
    stripeCustomerId,
  } = body;

  if (
    !guestName ||
    !guestEmail ||
    !totalPrice ||
    !stripeCustomerId
  ) {
    return NextResponse.json(
      { error: "Missing required fields or customerId" },
      { status: 400 }
    );
  }

  try {
    // ✅ 使用传入的 customerId
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: "off_session",
      payment_method_types: ["card"],
      metadata: {
        guestName,
        guestEmail,
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (err: any) {
    console.error("❌ setupintent 出错:", err.message, err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
