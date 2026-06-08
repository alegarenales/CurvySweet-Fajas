import { d as defineMiddleware, s as sequence } from './chunks/index_9m8gLaaa.mjs';
import { g as getAdminSession } from './chunks/admin_CkpypabV.mjs';
import { r as readAdminState } from './chunks/admin-state_k_CUmbN4.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_FM_RSgBg.mjs';
import 'piccolore';
import './chunks/astro/server_xK4l2Gy0.mjs';
import 'clsx';

const bypassPrefixes = ["/api", "/_astro", "/favicon"];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;
  if (!readAdminState().maintenance || getAdminSession(context.cookies) || bypassPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return next();
  }
  return new Response(
    `<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>CurvySweet en mantenimiento</title>
        <style>
          body {
            min-height: 100vh;
            margin: 0;
            display: grid;
            place-items: center;
            background: #0b0b0b;
            color: #fff;
            font-family: Arial, sans-serif;
          }
          main {
            width: min(92vw, 560px);
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 12px;
            padding: 32px;
            background: #171717;
          }
          p { color: #c7c7c7; line-height: 1.7; }
        </style>
      </head>
      <body>
        <main>
          <h1>CurvySweet esta en mantenimiento</h1>
          <p>Estamos ajustando la tienda. Vuelve en unos minutos.</p>
        </main>
      </body>
    </html>`,
    {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    }
  );
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
