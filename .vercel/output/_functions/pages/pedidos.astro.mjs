import { e as createAstro, f as createComponent } from '../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://curvysweet.com");
const $$Pedidos = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Pedidos;
  return Astro2.redirect("/perfil?tab=orders");
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/pedidos.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/pedidos.astro";
const $$url = "/pedidos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Pedidos,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
