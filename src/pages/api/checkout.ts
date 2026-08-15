import type { APIRoute } from "astro";
import Stripe from "stripe";
import { ProductRepository } from "../../repositories/ProductRepository";
import { getUserSession } from "../../lib/userSession";
import { getClientIp, readJsonBody } from "../../lib/security/http";
import { RATE_LIMITS, checkRateLimit } from "../../lib/security/rateLimit";
import { isValidIdentifier } from "../../lib/security/validation";
import { serverEnv } from "../../lib/security/secrets";

// En tiempo de ejecución: así la clave secreta de Stripe no queda escrita
// dentro de los ficheros generados por la compilación.
const stripeSecretKey = serverEnv("STRIPE_SECRET_KEY");

/** Tope de líneas por carrito, para que nadie pida miles de productos a la vez. */
const MAX_LINE_ITEMS = 20;

function jsonResponse(status: number, payload: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!stripeSecretKey) {
    // El detalle de qué variable falta es información de infraestructura: se
    // registra en el servidor, no se envía al navegador.
    console.error("Falta configurar STRIPE_SECRET_KEY en el entorno del servidor.");
    return jsonResponse(500, { error: "El pago no está disponible ahora mismo." });
  }

  const limit = checkRateLimit(getClientIp(request), RATE_LIMITS.checkout);

  if (!limit.allowed) {
    return jsonResponse(429, { error: "Demasiados intentos de pago. Espera unos minutos." });
  }

  const body = await readJsonBody<{
    productId?: string;
    items?: { productId?: string; quantity?: number }[];
  }>(request);

  if (!body) {
    return jsonResponse(400, { error: "Body inválido." });
  }

  const requestedItems = (
    Array.isArray(body.items) && body.items.length
      ? body.items
      : [{ productId: body.productId, quantity: 1 }]
  ).slice(0, MAX_LINE_ITEMS);

  if (requestedItems.some((item) => !isValidIdentifier(item.productId?.trim()))) {
    return jsonResponse(400, { error: "Hay productos inválidos en el carrito." });
  }

  const DEV_TEST_PRICE = serverEnv("STRIPE_TEST_PRICE_ID") ?? "";

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
      error: "Hay productos inválidos, sin stock o no configurados para pagos.",
      invalidProducts: invalid.join(","),
    });
  }
  const user = getUserSession(cookies);
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-05-27.dahlia' });

  // La URL de retorno nunca se toma de la petición: si dependiera de una
  // cabecera controlable por el cliente, se podría redirigir a la clienta a un
  // dominio ajeno tras pagar. Sale de la configuración del servidor.
  const baseUrl = import.meta.env.PUBLIC_SITE_URL || import.meta.env.SITE;

  if (!baseUrl) {
    console.error("Falta PUBLIC_SITE_URL: no se puede construir la URL de retorno de Stripe.");
    return jsonResponse(500, { error: "El pago no está disponible ahora mismo." });
  }

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
        usuarioId: user?.id ?? "",
      },
    });

    if (!session.url) {
      return jsonResponse(500, { error: "Stripe no devolvio URL de checkout." });
    }

    return jsonResponse(200, { url: session.url });
  } catch (error) {
    // Los mensajes de Stripe pueden mencionar identificadores de precio, claves
    // o límites de la cuenta. Se quedan en el registro del servidor.
    console.error("Error creando Checkout Session:", error);
    return jsonResponse(500, { error: "No se pudo iniciar el pago. Inténtalo de nuevo." });
  }
};
