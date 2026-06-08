import type { APIRoute } from "astro";
import Stripe from "stripe";
import { getProductById } from "../../lib/catalog";

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;

function jsonResponse(status: number, payload: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (!stripeSecretKey) {
    return jsonResponse(500, {
      error: "Falta configurar STRIPE_SECRET_KEY en el entorno del servidor.",
    });
  }

  let body: { productId?: string; items?: { productId?: string; quantity?: number }[] };
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Body invalido." });
  }

  const requestedItems = Array.isArray(body.items) && body.items.length
    ? body.items
    : [{ productId: body.productId, quantity: 1 }];

  const lineItems = requestedItems.map((item) => {
    const productId = item.productId?.trim();
    const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, 20));
    const product = productId ? getProductById(productId) : undefined;

    if (!product || !product.stripePriceId || !product.inStock) {
      return undefined;
    }

    return {
      price: product.stripePriceId,
      quantity,
      productId: product.id,
    };
  });

  if (lineItems.some((item) => !item) || !lineItems.length) {
    return jsonResponse(400, {
      error: "Hay productos invalidos, sin stock o no configurados para pagos.",
    });
  }

  const stripe = new Stripe(stripeSecretKey);
  const successUrl = new URL("/success?session_id={CHECKOUT_SESSION_ID}", request.url).toString();
  const cancelUrl = new URL("/cancel", request.url).toString();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((item) => ({
        price: item!.price,
        quantity: item!.quantity,
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      metadata: {
        productIds: lineItems.map((item) => item!.productId).join(","),
      },
    });

    if (!session.url) {
      return jsonResponse(500, { error: "Stripe no devolvio URL de checkout." });
    }

    return jsonResponse(200, { url: session.url });
  } catch (error) {
    console.error("Error creando Checkout Session:", error);
    return jsonResponse(500, { error: "No se pudo iniciar el checkout." });
  }
};
