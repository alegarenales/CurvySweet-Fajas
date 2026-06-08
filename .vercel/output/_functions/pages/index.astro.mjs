import { f as createComponent, m as maybeRenderHead, n as renderComponent, l as renderScript, r as renderTemplate, s as spreadAttributes, u as unescapeHTML, h as addAttribute, e as createAstro, k as renderHead } from '../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import { $ as $$UserMenu } from '../chunks/UserMenu_B9FtnUnI.mjs';
/* empty css                                 */
import 'clsx';
import { g as getProducts } from '../chunks/catalog_Cg0LSCvE.mjs';
export { renderers } from '../renderers.mjs';

const $$Welcome = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="bar-menu"> <nav> <a id="logo" href=".">CurvySweet</a> <div class="nav"> <a href=".">Home</a> <a href="/shop">Tienda</a> <a href="/login" data-guest-link>Iniciar Sesion</a> <a href="/register" data-guest-link>Registrarse</a> ${renderComponent($$result, "UserMenu", $$UserMenu, {})} <button id="theme-toggle" type="button">Modo oscuro</button> </div> </nav> </div> <section class="welcome-hero"> <div class="welcome-glow welcome-glow-left" aria-hidden="true"></div> <div class="welcome-glow welcome-glow-right" aria-hidden="true"></div> <div class="welcome-grid"> <div class="welcome-copy"> <p class="welcome-kicker">CurvySweet Collection</p> <h1>Prendas que abrazan tu silueta con una imagen mas suave y actual.</h1> <p class="welcome-lead">
Una tienda pensada para realzar curvas con estilo, comodidad y una experiencia
				visualmente mas cuidada desde el primer vistazo.
</p> <div class="welcome-actions"> <a class="primary-cta" href="/shop">Explorar tienda</a> <a class="secondary-cta" href="/login">Entrar a mi cuenta</a> </div> <div class="welcome-stats"> <article class="stat-card"> <span class="stat-label">Envios</span> <div class="shipping-belt" aria-label="Animacion de control de paquetes"> <div class="belt-track" aria-hidden="true"> <span class="quality-line"></span> <div class="package package-one"><span></span></div> <div class="package package-two"><span></span></div> <div class="package package-three"><span></span></div> </div> </div> <p>Paquetes revisados antes de salir hacia tu pedido.</p> </article> <article class="stat-card"> <span class="stat-label">Visitas</span> <strong id="visits-value">0</strong> <p id="visits-count">Personas que ya han pasado por CurvySweet.</p> </article> </div> </div> <div class="welcome-visual"> <div class="hero-card hero-card-main"> <p class="card-kicker">Nueva estetica</p> <h2>Elegancia ligera para sentirte segura en cada look.</h2> <div class="hero-pills"> <span>Moldeo suave</span> <span>Acabado premium</span> <span>Uso diario</span> </div> </div> <div class="hero-card hero-card-side"> <p class="card-kicker">Favoritas</p> <div class="mini-feature"> <strong>Faja chaleco cinturilla</strong> <span>Compresion comoda y silueta definida.</span> </div> <div class="mini-feature"> <strong>Cinturilla reloj arena</strong> <span>Una opcion pensada para remarcar cintura con estilo.</span> </div> </div> </div> </div> </section> ${renderScript($$result, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/Welcome.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/Welcome.astro", void 0);

function createSvgComponent({ meta, attributes, children }) {
  const Component = createComponent((_, props) => {
    const normalizedProps = normalizeProps(attributes, props);
    return renderTemplate`<svg${spreadAttributes(normalizedProps)}>${unescapeHTML(children)}</svg>`;
  });
  Object.defineProperty(Component, "toJSON", {
    value: () => meta,
    enumerable: false
  });
  return Object.assign(Component, meta);
}
const ATTRS_TO_DROP = ["xmlns", "xmlns:xlink", "version"];
const DEFAULT_ATTRS = {};
function dropAttributes(attributes) {
  for (const attr of ATTRS_TO_DROP) {
    delete attributes[attr];
  }
  return attributes;
}
function normalizeProps(attributes, props) {
  return dropAttributes({ ...DEFAULT_ATTRS, ...attributes, ...props });
}

const background = createSvgComponent({"meta":{"src":"/_astro/background.BPKAcmfN.svg","width":1440,"height":1024,"format":"svg"},"attributes":{"width":"1440","height":"1024","fill":"none"},"children":"<path fill=\"url(#a)\" fill-rule=\"evenodd\" d=\"M-217.58 475.75c91.82-72.02 225.52-29.38 341.2-44.74C240 415.56 372.33 315.14 466.77 384.9c102.9 76.02 44.74 246.76 90.31 366.31 29.83 78.24 90.48 136.14 129.48 210.23 57.92 109.99 169.67 208.23 155.9 331.77-13.52 121.26-103.42 264.33-224.23 281.37-141.96 20.03-232.72-220.96-374.06-196.99-151.7 25.73-172.68 330.24-325.85 315.72-128.6-12.2-110.9-230.73-128.15-358.76-12.16-90.14 65.87-176.25 44.1-264.57-26.42-107.2-167.12-163.46-176.72-273.45-10.15-116.29 33.01-248.75 124.87-320.79Z\" clip-rule=\"evenodd\" style=\"opacity:.154\" /><path fill=\"url(#b)\" fill-rule=\"evenodd\" d=\"M1103.43 115.43c146.42-19.45 275.33-155.84 413.5-103.59 188.09 71.13 409 212.64 407.06 413.88-1.94 201.25-259.28 278.6-414.96 405.96-130 106.35-240.24 294.39-405.6 265.3-163.7-28.8-161.93-274.12-284.34-386.66-134.95-124.06-436-101.46-445.82-284.6-9.68-180.38 247.41-246.3 413.54-316.9 101.01-42.93 207.83 21.06 316.62 6.61Z\" clip-rule=\"evenodd\" style=\"opacity:.154\" /><defs><linearGradient id=\"b\" x1=\"373\" x2=\"1995.44\" y1=\"1100\" y2=\"118.03\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#D83333\" /><stop offset=\"1\" stop-color=\"#F041FF\" /></linearGradient><linearGradient id=\"a\" x1=\"107.37\" x2=\"1130.66\" y1=\"1993.35\" y2=\"1026.31\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#3245FF\" /><stop offset=\"1\" stop-color=\"#BC52EE\" /></linearGradient></defs>"});

const $$ConfShopSection = createComponent(($$result, $$props, $$slots) => {
  const products = getProducts();
  const palette = [
    {
      accent: "#ff4eb7",
      accentSoft: "rgba(255, 78, 183, 0.2)",
      glow: "linear-gradient(135deg, #ffb5dc 0%, #ff4eb7 55%, #8f2fff 100%)"
    },
    {
      accent: "#ff7a59",
      accentSoft: "rgba(255, 122, 89, 0.2)",
      glow: "linear-gradient(135deg, #ffd0c4 0%, #ff7a59 52%, #ffb347 100%)"
    },
    {
      accent: "#8b5cf6",
      accentSoft: "rgba(139, 92, 246, 0.2)",
      glow: "linear-gradient(135deg, #d9c8ff 0%, #8b5cf6 48%, #4f46e5 100%)"
    },
    {
      accent: "#14b8a6",
      accentSoft: "rgba(20, 184, 166, 0.2)",
      glow: "linear-gradient(135deg, #b7fff3 0%, #14b8a6 50%, #0f766e 100%)"
    }
  ];
  const slides = (products.length ? products.slice(0, 3) : [
    /* fallback */
  ]).map((product, index) => ({
    ...product,
    ...palette[index % palette.length],
    index
  }));
  return renderTemplate`${maybeRenderHead()}<section class="shop-carousel-section" aria-label="Productos destacados"> <div class="shop-carousel-heading"> <p class="shop-carousel-kicker">CurvySweet Shop</p> <h2>Tu escaparate principal</h2> <p class="shop-carousel-subtitle">
Productos destacados y mas vendidos
</p> </div> <div class="shop-carousel" data-shop-carousel role="region" aria-roledescription="carousel" aria-label="Carrusel de productos"> <div class="shop-carousel-viewport"> <div class="shop-carousel-track" data-carousel-track> ${slides.map((slide, index) => renderTemplate`<article class="shop-slide" data-slide aria-roledescription="slide"${addAttribute(`Slide ${index + 1} de ${slides.length}`, "aria-label")}${addAttribute(index === 0 ? "false" : "true", "aria-hidden")}${addAttribute(`--slide-accent:${slide.accent}; --slide-accent-soft:${slide.accentSoft}; --slide-glow:${slide.glow};`, "style")}> <div class="shop-slide-copy"> <span class="shop-slide-tag">${slide.tag}</span> <h3${addAttribute(slide.id, "data-product-name")}>${slide.name}</h3> <p>${slide.description}</p> <div class="shop-slide-meta"> <strong${addAttribute(slide.id, "data-product-price")}>${slide.displayPrice}</strong> <a class="shop-slide-link" href="/shop">
Ver tienda
</a> </div> </div> <div class="shop-slide-visual" aria-hidden="true"> <div class="shop-slide-card"> <img${addAttribute(background.src, "src")} alt="" loading="lazy"> <div class="shop-slide-orb shop-slide-orb-one"></div> <div class="shop-slide-orb shop-slide-orb-two"></div> <div class="shop-slide-label"> <span>CurvySweet</span> <strong${addAttribute(slide.id, "data-product-name")}>${slide.name}</strong> </div> </div> </div> </article>`)} </div> </div> <div class="shop-carousel-controls"> <button type="button" class="shop-carousel-arrow" data-carousel-prev aria-label="Producto anterior"> <span aria-hidden="true">←</span> </button> <div class="shop-carousel-dots" role="tablist" aria-label="Seleccionar slide"> ${slides.map((slide, index) => renderTemplate`<button type="button"${addAttribute(`shop-carousel-dot ${index === 0 ? "is-active" : ""}`, "class")} data-carousel-dot${addAttribute(index, "data-index")} role="tab"${addAttribute(index === 0 ? "true" : "false", "aria-selected")}${addAttribute(`Ir a ${slide.name}`, "aria-label")}></button>`)} </div> <button type="button" class="shop-carousel-arrow" data-carousel-next aria-label="Siguiente producto"> <span aria-hidden="true">→</span> </button> </div> </div> </section> ${renderScript($$result, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/conf_ShopSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/conf_ShopSection.astro", void 0);

const $$Astro = createAstro("https://curvysweet.com");
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CurvySweet</title>${renderHead()}</head> <body> ${renderComponent($$result, "Welcome", $$Welcome, {})} ${renderComponent($$result, "ShopSection", $$ConfShopSection, {})} </body></html>`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/index.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
