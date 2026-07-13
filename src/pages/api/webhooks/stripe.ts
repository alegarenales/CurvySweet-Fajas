import type { APIRoute } from "astro";
import { sendPurchaseEmail } from "../../../lib/mail";
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
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-05-27.dahlia' });

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

    const email = session.customer_details?.email;

    if (email) {
      await sendPurchaseEmail({
        to: email,
        name: session.customer_details?.name ?? "Cliente",
        products: [
          {
            name: "Tu pedido CurvySweet",
            quantity: 1,
            price: `${((session.amount_total ?? 0) / 100).toFixed(2)} €`,
          },
        ],
        total: `${((session.amount_total ?? 0) / 100).toFixed(2)} €`,
      });
    }

    break;
  }

  default:
    console.log(`Evento Stripe ignorado: ${event.type}`);
    break;
}

return new Response("ok", { status: 200 })};