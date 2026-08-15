import type { APIRoute } from "astro";
import { sendPurchaseEmail } from "../../../lib/mail";
import { OrderRepository } from "../../../repositories/OrderRepository";
import { UserRepository } from "../../../repositories/UserRepository";
import Stripe from "stripe";
import { serverEnv } from "../../../lib/security/secrets";

// En tiempo de ejecución: ni la clave secreta ni el secreto de firma del
// webhook deben acabar dentro de los ficheros generados por la compilación.
const stripeSecretKey = serverEnv("STRIPE_SECRET_KEY");
const stripeWebhookSecret = serverEnv("STRIPE_WEBHOOK_SECRET");

export const POST: APIRoute = async ({ request }) => {
  if (!stripeSecretKey || !stripeWebhookSecret) {
    return new Response("Configuración de Stripe incompleta.", { status: 500 });
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
    console.error("Firma de webhook inválida:", error);
    return new Response("Firma inválida.", { status: 400 });
  }

switch (event.type) {

  case "checkout.session.completed": {

    const session = await stripe.checkout.sessions.retrieve(
      (event.data.object as Stripe.Checkout.Session).id,
      {
        expand: [
          "line_items",
          "customer"
          ]
      }
    );

    // El registro no incluye correo ni nombre: los registros de Vercel los
    // puede leer cualquiera con acceso al proyecto, y son datos personales.
    console.log("Pago confirmado:", {
      sessionId: session.id,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
    });

    const usuarioId = session.metadata?.usuarioId || null;
    const usuario = usuarioId
      ? await UserRepository.getById(usuarioId)
      : null;

    const pedidoId = await OrderRepository.createOrder({

      stripeSessionId: session.id,

      usuarioId,

      nombre: usuario?.Name ?? session.customer_details?.name ?? "Cliente",

      email: session.customer_details?.email ?? "",

      teléfono: session.customer_details?.phone ?? null,

      importeTotal: (session.amount_total ?? 0) / 100

    });
    await OrderRepository.addHistory(
        pedidoId,
        "Pendiente"
    );
    for (const item of session.line_items?.data ?? []) {

      await OrderRepository.addProduct({

        pedidoId,

        productoId: item.price?.id ?? "",

        nombreProducto: item.description,

        cantidad: item.quantity ?? 1,

        precioUnitario:
          ((item.amount_total ?? 0) / 100) /
          (item.quantity ?? 1),

      });

    }

    const email = session.customer_details?.email;

    if (email) {
      await sendPurchaseEmail({

          to: email,

          name: usuario?.Name ?? session.customer_details?.name ?? "Cliente",

          products:

              (session.line_items?.data ?? []).map(item => ({

                  name: item.description,

                  quantity: item.quantity ?? 1,

                  price: `${(
                    ((item.amount_total ?? 0) / 100) /
                    (item.quantity ?? 1)
                  ).toFixed(2)} €`

              })),

          total: `${((session.amount_total ?? 0) / 100).toFixed(2)} €`

      });
    }

    break;
  }

  default:
    console.log(`Evento Stripe ignorado: ${event.type}`);
    break;
}

return new Response("ok", { status: 200 })};