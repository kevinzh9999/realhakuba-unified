import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const {
    totalPrice,
    currency = "jpy",
    guestName,
    guestEmail,
    stripeCustomerId, // ✅ 从 wrapper 传入
  } = await request.json();

  if (!totalPrice || !stripeCustomerId) {
    return new Response(
      JSON.stringify({ error: "totalPrice and stripeCustomerId are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(totalPrice),
      currency,
      customer: stripeCustomerId, // ✅ 使用传入的 customerId
      metadata: {
        guestName: guestName || "N/A",
        ...(guestEmail && guestEmail.includes("@") ? { guestEmail } : {}),
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}