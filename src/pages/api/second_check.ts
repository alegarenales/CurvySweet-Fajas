import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async () => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Producto de prueba",
          },
          unit_amount: 2000, // 20€
        },
        quantity: 1,
      },
    ],
    success_url: `${import.meta.env.PUBLIC_DOMAIN}/success`,
    cancel_url: `${import.meta.env.PUBLIC_DOMAIN}/cancel`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
  });
};