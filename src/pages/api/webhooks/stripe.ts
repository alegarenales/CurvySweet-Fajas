import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  if (!stripeSecretKey || !stripeWebhookSecret) {
    return new Response("Configuracion de Stripe incompleta.", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Falta stripe-signature.", { status: 400 });
  }

  const payload = await request.text();
  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
  } catch (error) {
    console.error("Firma de webhook invalida:", error);
    return new Response("Firma invalida.", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Pago confirmado:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email ?? null,
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
      });
      break;
    }
    default:
      console.log(`Evento Stripe ignorado: ${event.type}`);
      break;
  }

  return new Response("ok", { status: 200 });
};
