import type { APIRoute } from "astro";
import Stripe from "stripe";
import { ProductRepository } from "../../repositories/ProductRepository";

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

  const DEV_TEST_PRICE = import.meta.env.STRIPE_TEST_PRICE_ID ?? "";

const lineItems = await Promise.all(
  requestedItems.map(async (item) => {
    const productId = item.productId?.trim();
    const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, 20));

    const product = productId
      ? await ProductRepository.getProductById(productId)
      : undefined;

    if (!product || !product.inStock) {
      return undefined;
    }

    const priceId =
      product.stripePriceId ||
      (
        import.meta.env.MODE === "development" && DEV_TEST_PRICE
          ? DEV_TEST_PRICE
          : ""
      );

    if (!priceId) {
      return undefined;
    }

    return {
      price: priceId,
      quantity,
      productId: product.id,
    };
  })
);

  if (lineItems.some((item) => !item) || !lineItems.length) {
    const invalid: string[] = [];

    for (const it of requestedItems) {

      const pid = it.productId?.trim();

      const product = pid
        ? await ProductRepository.getProductById(pid)
        : undefined;

      const hasPrice =
        product &&
        (
          product.stripePriceId ||
          (
            import.meta.env.MODE === "development" &&
            DEV_TEST_PRICE
          )
        );

      if (!product || !product.inStock || !hasPrice) {
        invalid.push(pid || "(sin id)");
      }
    }

    return jsonResponse(400, {
      error: "Hay productos invalidos, sin stock o no configurados para pagos.",
      invalidProducts: invalid.join(","),
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-05-27.dahlia' });
  const baseUrl = import.meta.env.PUBLIC_SITE_URL;

  const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/cancel`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
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
    const stripeError = error instanceof Error ? error.message : "Error desconocido de Stripe.";
    console.error("Error creando Checkout Session:", error);
    return jsonResponse(500, {
      error: `No se pudo iniciar el checkout. ${stripeError}`,
      stripeError,
    });
  }
};
