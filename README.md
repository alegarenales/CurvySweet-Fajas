# CurvySweet - Pago con Stripe (Astro)

Este proyecto tiene un flujo de pago funcional con Stripe Checkout y webhook verificado en servidor.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variables de entorno

1. Copia `.env.example` a `.env`.
2. Completa tus claves y Price IDs de Stripe:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_CURVY_FAJA_SCULPT`
   - `STRIPE_PRICE_SWEET_BODYSUIT_LIFT`
   - `STRIPE_PRICE_CURVY_SET_ROSE`

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
