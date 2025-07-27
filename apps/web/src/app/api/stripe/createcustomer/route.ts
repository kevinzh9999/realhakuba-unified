import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { guestName, guestEmail } = await req.json();

    if (!guestName || !guestEmail) {
      return new Response(
        JSON.stringify({ error: "Missing guest name or email" }),
        {
          status: 400,
        }
      );
    }

    const customer = await stripe.customers.create({
      name: guestName,
      email: guestEmail,
    });

    return Response.json({ customerId: customer.id });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "❌ Stripe createCustomer error:",
        error.message,
        error.stack
      );
    } else {
      console.error("❌ Unknown error:", error);
    }
    return new Response(
      JSON.stringify({ error: "Failed to create Stripe customer" }),
      {
        status: 500,
      }
    );
  }
}
