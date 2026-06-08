import { f as createComponent, m as maybeRenderHead, n as renderComponent, h as addAttribute, r as renderTemplate, l as renderScript, k as renderHead } from '../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import { $ as $$UserMenu } from '../chunks/UserMenu_B9FtnUnI.mjs';
import { $ as $$CartDrawer } from '../chunks/CartDrawer_8i1PYsQA.mjs';
import { g as getProducts } from '../chunks/catalog_Cg0LSCvE.mjs';
/* empty css                                */
export { renderers } from '../renderers.mjs';

const $$ConfShop = createComponent(($$result, $$props, $$slots) => {
  const products = getProducts();
  return renderTemplate`${maybeRenderHead()}<div id="bar-menu"> <nav> <a id="logo" href=".">CurvySweet</a> <div class="nav"> <a href=".">Home</a> <a href="/shop">Tienda</a> <a href="/login" data-guest-link>Iniciar Sesion</a> <a href="/register" data-guest-link>Registrarse</a> <button class="cart-nav-button" type="button" data-cart-open aria-label="Abrir carrito"> <span class="cart-nav-icon" aria-hidden="true">Cart</span> <span class="cart-nav-count" data-cart-count>0</span> </button> ${renderComponent($$result, "UserMenu", $$UserMenu, {})} <button id="theme-toggle" type="button">Modo oscuro</button> </div> </nav> </div> <section class="shop-section" id="shop"> <div class="shop-header"> <p class="shop-kicker">CurvySweet</p> <h2>Tienda</h2> <p class="shop-subtitle">Descubre nuestras piezas mas vendidas para realzar tu figura.</p> </div> <div class="shop-grid"> ${products.map((product) => renderTemplate`<article class="product-card"${addAttribute(product.link ? "link" : void 0, "role")}${addAttribute(product.link ? "0" : void 0, "tabindex")}${addAttribute(product.link ?? "", "data-product-link")} onclick="handleProductCardClick(event)" onkeydown="handleProductCardKeydown(event)"${addAttribute(product.link ? "cursor: pointer;" : "", "style")}> <div class="product-card-top"> <span class="product-tag">${product.tag}</span> <span${addAttribute(`stock-indicator ${product.inStock ? "is-in-stock" : "is-out-of-stock"}`, "class")}${addAttribute(product.id, "data-product-stock")}${addAttribute(product.inStock ? "Producto en stock" : "Producto sin stock", "aria-label")}${addAttribute(product.inStock ? "Producto en stock" : "Producto sin stock", "title")}> <span class="stock-dot" aria-hidden="true"></span> <span class="stock-text" data-stock-text> ${product.inStock ? "En stock" : "Sin stock"} </span> </span> </div> <div class="product-image" role="img"${addAttribute(product.name, "aria-label")}${addAttribute(product.images?.join("|") ?? (product.image ?? ""), "data-product-images")}> <div class="product-image-layer is-active" data-image-primary${addAttribute(product.id, "data-product-image")}${addAttribute(product.image ? `background-image: url('${product.image}');` : `background-image: radial-gradient(circle at 75% 20%, rgba(255, 255, 255, 0.7), transparent 55%), linear-gradient(135deg, #ff8fcb, #f04aa8);`, "style")}></div> <div class="product-image-layer" data-image-secondary></div> </div> <h3${addAttribute(product.id, "data-product-name")}>${product.name}</h3>  <div class="product-footer"> <strong${addAttribute(product.id, "data-product-price")}>${product.displayPrice}</strong> <button type="button" class="add-button" data-cart-add${addAttribute(product.id, "data-product-id")}${addAttribute(product.inStock, "data-in-stock")}>
Anadir al carrito
</button> </div> </article>`)} </div> <div id="popupWarning" class="popup-warning hidden" role="dialog" aria-modal="true" aria-labelledby="popup-title"> <div class="popup-card"> <div class="popup-icon" aria-hidden="true">!</div> <h3 id="popup-title">Atencion</h3> <p id="checkout-error" class="popup-message" role="alert" aria-live="polite"></p> <button id="btnClose" class="popup-close" type="button">Entendido</button> </div> </div> <!-- <div class="checkout-legal">
		<label for="legal-consent">
			<input id="legal-consent" type="checkbox" />
			<span>
				Acepto los
				<a href="/legal/terminos" target="_blank" rel="noopener noreferrer">Terminos</a>,
				<a href="/legal/privacidad" target="_blank" rel="noopener noreferrer">Privacidad</a>
				y
				<a href="/legal/reembolsos" target="_blank" rel="noopener noreferrer">Reembolsos</a>.
			</span>
		</label>
	</div> --> </section> ${renderComponent($$result, "CartDrawer", $$CartDrawer, {})} ${renderScript($$result, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/conf_shop.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/conf_shop.astro", void 0);

const $$Shop = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tienda</title>${renderHead()}</head> <body> ${renderComponent($$result, "Shop_page", $$ConfShop, {})} </body></html>`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/shop.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/shop.astro";
const $$url = "/shop";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Shop,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
