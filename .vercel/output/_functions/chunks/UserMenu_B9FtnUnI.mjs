import { f as createComponent, m as maybeRenderHead, l as renderScript, r as renderTemplate } from './astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$UserMenu = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="user-menu" data-user-menu hidden> <button class="user-menu-button" type="button" data-user-menu-button aria-expanded="false"> <span class="user-avatar" data-user-avatar data-avatar-style="berry">U</span> <span data-user-name>Mi cuenta</span> </button> <div class="user-menu-panel" data-user-menu-panel hidden> <a href="/perfil">Mi perfil</a> <a href="/pedidos">Mis pedidos</a> <button type="button" data-logout-button>Cerrar sesion</button> </div> </div> ${renderScript($$result, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/UserMenu.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/UserMenu.astro", void 0);

export { $$UserMenu as $ };
