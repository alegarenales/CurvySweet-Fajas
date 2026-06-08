import { f as createComponent, k as renderHead, r as renderTemplate } from '../../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const $$Privacidad = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Politica de Privacidad | CurvySweet</title>${renderHead()}</head> <body> <main> <h1>Politica de Privacidad</h1> <p>Recolectamos datos necesarios para procesar compras y soporte al cliente.</p> <p>Los datos de pago son gestionados por Stripe; CurvySweet no almacena tarjetas.</p> <p>Puedes solicitar acceso o eliminacion de tus datos segun la ley aplicable.</p> <p>Verifica este contenido con asesoria legal para cumplimiento total.</p> </main> </body></html>`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/legal/privacidad.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/legal/privacidad.astro";
const $$url = "/legal/privacidad";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Privacidad,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
