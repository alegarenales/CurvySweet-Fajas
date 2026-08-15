import type { APIRoute } from "astro";
import Stripe from "stripe";
import { serverEnv } from "../../lib/security/secrets";

// En tiempo de ejecución: así la clave secreta de Stripe no queda escrita
// dentro de los ficheros generados por la compilación.
const stripeSecretKey = serverEnv("STRIPE_SECRET_KEY");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const sessionId = url.searchParams.get("session_id")?.trim();

  if (!stripeSecretKey || !sessionId || !sessionId.startsWith("cs_")) {
    return json({ ok: false, message: "Sesion de pago inválida." }, 400);
  }

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-05-27.dahlia' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return json({ ok: false, message: "El pago aun no esta confirmado." }, 409);
    }

    return json({
      ok: true,
      order: {
        id: session.id,
        date: new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(session.created * 1000)),
        status: "Confirmado",
        total: session.amount_total == null
          ? "Pago confirmado"
          : new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: session.currency?.toUpperCase() || "EUR",
            }).format(session.amount_total / 100),
      },
    });
  } catch (error) {
    console.error("No se pudo verificar la sesión de Stripe:", error);
    return json({ ok: false, message: "No se pudo verificar el pedido." }, 404);
  }
};
