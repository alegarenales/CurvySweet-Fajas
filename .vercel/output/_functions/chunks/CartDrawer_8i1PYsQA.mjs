import { f as createComponent, r as renderTemplate, l as renderScript, m as maybeRenderHead, u as unescapeHTML } from './astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
import { g as getProducts } from './catalog_Cg0LSCvE.mjs';
/* empty css                        */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$CartDrawer = createComponent(($$result, $$props, $$slots) => {
  const cartProducts = getProducts().map((product) => ({
    id: product.id,
    name: product.name,
    price: product.displayPrice,
    image: product.image ?? "",
    inStock: product.inStock,
    link: product.link ?? "/shop"
  }));
  return renderTemplate(_a || (_a = __template(['<script id="curvysweet-cart-products" type="application/json">', "<\/script> ", '<div class="cart-overlay" data-cart-overlay hidden></div> <aside class="cart-drawer" data-cart-drawer aria-hidden="true" aria-label="Carrito"> <div class="cart-drawer-header"> <div> <p class="cart-kicker">CurvySweet</p> <h2>Carrito</h2> </div> <button class="cart-icon-button" type="button" data-cart-close aria-label="Cerrar carrito">x</button> </div> <div class="cart-empty" data-cart-empty> <p>Tu carrito esta vacio.</p> <a href="/shop">Ver productos</a> </div> <div class="cart-items" data-cart-items></div> <div class="cart-drawer-footer"> <p class="cart-stock-warning" data-cart-stock-warning hidden>\nHay productos sin stock. Quitalos del carrito para poder finalizar la compra.\n</p> <p class="cart-error" data-cart-error hidden></p> <div class="cart-total-row"> <span>Total estimado</span> <strong data-cart-total>0 EUR</strong> </div> <div class="cart-footer-actions"> <button class="cart-secondary-button" type="button" data-cart-clear>Vaciar</button> <button class="cart-primary-button" type="button" data-cart-checkout>Finalizar compra</button> </div> </div> </aside> ', ""])), unescapeHTML(JSON.stringify(cartProducts)), maybeRenderHead(), renderScript($$result, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/CartDrawer.astro?astro&type=script&index=0&lang.ts"));
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/CartDrawer.astro", void 0);

export { $$CartDrawer as $ };
