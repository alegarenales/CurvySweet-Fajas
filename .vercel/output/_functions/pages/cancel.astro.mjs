import { f as createComponent, k as renderHead, r as renderTemplate } from '../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

const $$Cancel = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es" data-astro-cid-jumhs7sz> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pago cancelado | CurvySweet</title>${renderHead()}</head> <body data-astro-cid-jumhs7sz> <main class="status-page" data-astro-cid-jumhs7sz> <section class="status-card" data-astro-cid-jumhs7sz> <p class="status-kicker" data-astro-cid-jumhs7sz>CurvySweet</p> <h1 data-astro-cid-jumhs7sz>Pago cancelado</h1> <p data-astro-cid-jumhs7sz>No se realizo ningun cobro. Puedes intentarlo otra vez cuando quieras.</p> <a href="/" data-astro-cid-jumhs7sz>Volver a la tienda</a> </section> </main> </body></html>`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/cancel.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/cancel.astro";
const $$url = "/cancel";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cancel,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
