import { f as createComponent, k as renderHead, r as renderTemplate } from '../../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const $$Terminos = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Terminos y Condiciones | CurvySweet</title>${renderHead()}</head> <body> <main> <h1>Terminos y Condiciones</h1> <p>Al comprar en CurvySweet aceptas estas condiciones de venta.</p> <p>Los precios, disponibilidad y promociones pueden cambiar sin previo aviso.</p> <p>El uso del sitio implica aceptar nuestras politicas de privacidad y reembolsos.</p> <p>Para cumplimiento local, valida este texto con un abogado de tu jurisdiccion.</p> </main> </body></html>`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/legal/terminos.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/legal/terminos.astro";
const $$url = "/legal/terminos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Terminos,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
