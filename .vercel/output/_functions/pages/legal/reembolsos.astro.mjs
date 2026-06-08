import { f as createComponent, k as renderHead, r as renderTemplate } from '../../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const $$Reembolsos = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Politica de Reembolsos | CurvySweet</title>${renderHead()}</head> <body> <main> <h1>Politica de Reembolsos</h1> <p>Las solicitudes de reembolso se evaluan caso por caso segun estado del producto.</p> <p>El plazo sugerido para solicitar reembolso es dentro de 14 dias desde la compra.</p> <p>Los cargos de envio pueden no ser reembolsables salvo defecto de fabrica.</p> <p>Confirma esta politica con asesor legal antes de operar comercialmente.</p> </main> </body></html>`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/legal/reembolsos.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/legal/reembolsos.astro";
const $$url = "/legal/reembolsos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Reembolsos,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
