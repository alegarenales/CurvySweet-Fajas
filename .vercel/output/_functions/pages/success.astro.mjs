import { e as createAstro, f as createComponent, r as renderTemplate, o as defineScriptVars, k as renderHead } from '../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://curvysweet.com");
const $$Success = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Success;
  const sessionId = Astro2.url.searchParams.get("session_id");
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-5y44lzmc> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pago confirmado | CurvySweet</title>', '</head> <body data-astro-cid-5y44lzmc> <main class="status-page" data-astro-cid-5y44lzmc> <section class="status-card" data-astro-cid-5y44lzmc> <p class="status-kicker" data-astro-cid-5y44lzmc>CurvySweet</p> <h1 data-astro-cid-5y44lzmc>Pago confirmado</h1> <p data-astro-cid-5y44lzmc>Tu compra fue procesada correctamente.</p> ', ' <a href="/" data-astro-cid-5y44lzmc>Volver a la tienda</a> </section> </main>  <script>(function(){', '\n  const readJson = (key, fallback) => {\n    try {\n      return JSON.parse(localStorage.getItem(key) || "") ?? fallback;\n    } catch {\n      return fallback;\n    }\n  };\n\n  const user = readJson("curvysweetUser", null);\n\n  if (sessionId && user) {\n    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)\n      .then((response) => response.json())\n      .then((result) => {\n        if (!result.ok || !result.order) return;\n\n        const identity = String(user.mail || user.username || "guest").trim().toLowerCase();\n        const storageKey = `curvysweetOrders:${identity}`;\n        const orders = readJson(storageKey, []);\n\n        if (!orders.some((order) => order.id === result.order.id)) {\n          orders.unshift(result.order);\n          localStorage.setItem(storageKey, JSON.stringify(orders));\n        }\n      })\n      .catch(() => {});\n  }\n})();<\/script></body></html>'], ['<html lang="es" data-astro-cid-5y44lzmc> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pago confirmado | CurvySweet</title>', '</head> <body data-astro-cid-5y44lzmc> <main class="status-page" data-astro-cid-5y44lzmc> <section class="status-card" data-astro-cid-5y44lzmc> <p class="status-kicker" data-astro-cid-5y44lzmc>CurvySweet</p> <h1 data-astro-cid-5y44lzmc>Pago confirmado</h1> <p data-astro-cid-5y44lzmc>Tu compra fue procesada correctamente.</p> ', ' <a href="/" data-astro-cid-5y44lzmc>Volver a la tienda</a> </section> </main>  <script>(function(){', '\n  const readJson = (key, fallback) => {\n    try {\n      return JSON.parse(localStorage.getItem(key) || "") ?? fallback;\n    } catch {\n      return fallback;\n    }\n  };\n\n  const user = readJson("curvysweetUser", null);\n\n  if (sessionId && user) {\n    fetch(\\`/api/checkout-session?session_id=\\${encodeURIComponent(sessionId)}\\`)\n      .then((response) => response.json())\n      .then((result) => {\n        if (!result.ok || !result.order) return;\n\n        const identity = String(user.mail || user.username || "guest").trim().toLowerCase();\n        const storageKey = \\`curvysweetOrders:\\${identity}\\`;\n        const orders = readJson(storageKey, []);\n\n        if (!orders.some((order) => order.id === result.order.id)) {\n          orders.unshift(result.order);\n          localStorage.setItem(storageKey, JSON.stringify(orders));\n        }\n      })\n      .catch(() => {});\n  }\n})();<\/script></body></html>'])), renderHead(), sessionId && renderTemplate`<p class="session-id" data-astro-cid-5y44lzmc>ID de sesion: <code data-astro-cid-5y44lzmc>${sessionId}</code></p>`, defineScriptVars({ sessionId }));
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/success.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/success.astro";
const $$url = "/success";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Success,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
