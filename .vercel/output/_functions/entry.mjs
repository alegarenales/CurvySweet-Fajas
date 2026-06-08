import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BDlfjkVS.mjs';
import { manifest } from './manifest_87rO8BIP.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/admin/catalog.astro.mjs');
const _page2 = () => import('./pages/api/admin/maintenance.astro.mjs');
const _page3 = () => import('./pages/api/admin/metrics.astro.mjs');
const _page4 = () => import('./pages/api/admin/users.astro.mjs');
const _page5 = () => import('./pages/api/checkout.astro.mjs');
const _page6 = () => import('./pages/api/checkout-session.astro.mjs');
const _page7 = () => import('./pages/api/login.astro.mjs');
const _page8 = () => import('./pages/api/logout.astro.mjs');
const _page9 = () => import('./pages/api/register.astro.mjs');
const _page10 = () => import('./pages/api/visits.astro.mjs');
const _page11 = () => import('./pages/api/webhooks/stripe.astro.mjs');
const _page12 = () => import('./pages/cancel.astro.mjs');
const _page13 = () => import('./pages/legal/privacidad.astro.mjs');
const _page14 = () => import('./pages/legal/reembolsos.astro.mjs');
const _page15 = () => import('./pages/legal/terminos.astro.mjs');
const _page16 = () => import('./pages/login.astro.mjs');
const _page17 = () => import('./pages/pedidos.astro.mjs');
const _page18 = () => import('./pages/perfil.astro.mjs');
const _page19 = () => import('./pages/producto/cinturilla_reloj_arena.astro.mjs');
const _page20 = () => import('./pages/producto/faja_chaleco_cinturilla.astro.mjs');
const _page21 = () => import('./pages/producto/faja_control_abdominal.astro.mjs');
const _page22 = () => import('./pages/producto/faja_latex.astro.mjs');
const _page23 = () => import('./pages/producto/faja_moldeadora.astro.mjs');
const _page24 = () => import('./pages/register.astro.mjs');
const _page25 = () => import('./pages/shop.astro.mjs');
const _page26 = () => import('./pages/success.astro.mjs');
const _page27 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/admin/catalog.ts", _page1],
    ["src/pages/api/admin/maintenance.ts", _page2],
    ["src/pages/api/admin/metrics.ts", _page3],
    ["src/pages/api/admin/users.ts", _page4],
    ["src/pages/api/checkout.ts", _page5],
    ["src/pages/api/checkout-session.ts", _page6],
    ["src/pages/api/login.ts", _page7],
    ["src/pages/api/logout.ts", _page8],
    ["src/pages/api/register.ts", _page9],
    ["src/pages/api/visits.ts", _page10],
    ["src/pages/api/webhooks/stripe.ts", _page11],
    ["src/pages/cancel.astro", _page12],
    ["src/pages/legal/privacidad.astro", _page13],
    ["src/pages/legal/reembolsos.astro", _page14],
    ["src/pages/legal/terminos.astro", _page15],
    ["src/pages/login.astro", _page16],
    ["src/pages/pedidos.astro", _page17],
    ["src/pages/perfil.astro", _page18],
    ["src/pages/producto/cinturilla_reloj_arena.astro", _page19],
    ["src/pages/producto/faja_chaleco_cinturilla.astro", _page20],
    ["src/pages/producto/faja_control_abdominal.astro", _page21],
    ["src/pages/producto/faja_latex.astro", _page22],
    ["src/pages/producto/faja_moldeadora.astro", _page23],
    ["src/pages/register.astro", _page24],
    ["src/pages/shop.astro", _page25],
    ["src/pages/success.astro", _page26],
    ["src/pages/index.astro", _page27]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "dccf0c25-285e-4546-9bd4-afa6aef7050b",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
