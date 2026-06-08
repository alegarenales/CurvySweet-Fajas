# CurvySweet - Pago con Stripe (Astro)

Este proyecto tiene un flujo de pago funcional con Stripe Checkout y webhook verificado en servidor.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variables de entorno (habilitar pagos reales)

1. Copia `.env.example` a `.env`.
2. Rellena con las credenciales y Price IDs reales de Stripe. Para producción usa las claves `sk_live_...` y los `price_...` correspondientes.
  - `STRIPE_SECRET_KEY` (ej. `sk_live_...`)
  - `STRIPE_WEBHOOK_SECRET` (webhook secret: `whsec_...`)
  - `STRIPE_PRICE_FAJA_CHALECO_CINTURILLA` (price ID creado en Stripe para ese producto)
  - `STRIPE_PRICE_CINTURILLA_RELOJ_ARENA`
  - `STRIPE_PRICE_FAJA_CONTROL_ABDOMINAL`
  - `STRIPE_PRICE_FAJA_LATEX`
  - `STRIPE_PRICE_FAJA_MOLDEADORA`
  - `STRIPE_PRICE_FAJA_MOLDEADORA_REDUCTORA` o `STRIPE_PRICE_FAJA_SHORT_MOLEDEADORA` también funcionan como alias para el mismo producto.

## 3. Ejecutar en local

```bash
npm run dev
```

## 4. Probar webhook local

Con Stripe CLI:

```bash
stripe listen --forward-to localhost:4321/api/webhooks/stripe
```

Copia el `whsec_...` generado por CLI a `STRIPE_WEBHOOK_SECRET`.

## Flujo implementado

- `POST /api/checkout`: crea sesión de Stripe usando `price_id` desde servidor.
- `POST /api/webhooks/stripe`: valida firma y procesa `checkout.session.completed`.
- Frontend de tienda con checkbox legal obligatorio antes de iniciar pago.
- Páginas de resultado: `/success` y `/cancel`.
- Páginas legales base:
  - `/legal/terminos`
  - `/legal/privacidad`
  - `/legal/reembolsos`

## Nota legal importante

Las páginas legales incluidas son base técnica y no sustituyen asesoría jurídica. Ajusta términos, privacidad, impuestos, devoluciones y cumplimiento (por ejemplo, estado/país) con un abogado antes de operar comercialmente.

## ¿Por qué aparece el error "Hay productos invalidos, sin stock o no configurados para pagos."?

Ese error se lanza cuando el servidor intenta crear la sesión de Stripe y alguno de los productos solicitados cumple alguna de estas condiciones:
- No existe el producto solicitado en el catálogo.
- El producto tiene `inStock: false`.
- El producto no tiene un `stripePriceId` válido (cadena vacía). Esto ocurre cuando no has puesto el `price_...` correspondiente en las variables de entorno.

Solución rápida:
 - Asegúrate de que `.env` contiene `STRIPE_SECRET_KEY` y los `STRIPE_PRICE_*` reales (price IDs) y reinicia el servidor.
 - Verifica el stock en los borradores de catálogo: `.curvysweet/catalog-drafts.json` puede sobreescribir `inStock`.

Dónde encontrar las claves en Stripe:

- `STRIPE_SECRET_KEY`: En el Dashboard de Stripe → Developers → API keys. Usa la `Secret key` (en modo prueba `sk_test_...` o producción `sk_live_...`).
- `STRIPE_WEBHOOK_SECRET`: Cuando configures un endpoint en Dashboard → Developers → Webhooks, genera/consulta el `whsec_...`. Para pruebas locales puedes usar `stripe listen` y copiar el `whsec_...` que genera.
- `price_...` (Price IDs): En Dashboard → Products crea un producto y añade un Price (por ejemplo, con moneda EUR). El `Price ID` aparece en la página del Price y tiene el formato `price_...`.

Uso del fallback para pruebas locales:

Si no quieres crear price IDs por producto durante desarrollo, puedes definir en tu `.env` una variable `STRIPE_TEST_PRICE_ID=price_...` con un `price_` válido creado en Stripe (puede ser un price de prueba). En modo `astro dev` la API de checkout usará ese `price` como fallback para cualquier producto que no tenga `stripePriceId` configurado. **No** pongas un `STRIPE_TEST_PRICE_ID` en producción.

Si quieres que revise la configuración o añadir un modo de fallback más explícito para identificar qué productId falla, dímelo y lo implemento con cuidado.
