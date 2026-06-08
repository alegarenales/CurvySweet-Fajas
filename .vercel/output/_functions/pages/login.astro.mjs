import { f as createComponent, m as maybeRenderHead, l as renderScript, r as renderTemplate, k as renderHead, n as renderComponent } from '../chunks/astro/server_xK4l2Gy0.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$ConfLogin = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="login-shell"> <div class="login-glow login-glow-left" aria-hidden="true"></div> <div class="login-glow login-glow-right" aria-hidden="true"></div> <div class="login-layout"> <aside class="login-copy"> <p class="login-eyebrow">CurvySweet</p> <h1>Inicia sesion de forma sencilla</h1> <p class="login-description">
Un acceso visualmente suave, femenino y actual para que el primer vistazo ya se
				sienta como marca.
</p> <div class="login-highlights"> <div class="highlight-card"> <span class="highlight-number">01</span> <p>Nadie puede ver tu contrasena.</p> </div> <div class="highlight-card"> <span class="highlight-number">02</span> <p>Campos mas claros, agradables al foco y faciles de recorrer.</p> </div> </div> </aside> <div class="login-card" data-auth-mode="login"> <div class="login-card-header"> <div class="login-card-topbar"> <p class="login-badge">Bienvenida</p> <a class="back-home" href="/">Volver a casa</a> </div> <div class="auth-toggle" role="tablist" aria-label="Cambiar formulario"> <button type="button" class="auth-tab is-active" data-auth-target="login" role="tab" aria-selected="true">
Iniciar sesion
</button> <button type="button" class="auth-tab" data-auth-target="register" role="tab" aria-selected="false">
Registrarse
</button> </div> <p class="auth-subtitle" data-auth-subtitle>Introduzca sus datos</p> </div> <div class="auth-panels"> <form class="login-form auth-panel is-active" data-auth-panel="login" method="POST" action="/api/login"> <!-- <div class="input-grid">
						<label class="input-box">
							<span>Nombre</span>
							<input type="text" placeholder="Tu nombre" />
						</label>
						<label class="input-box">
							<span>Apellido</span>
							<input type="text" placeholder="Tu apellido" />
						</label>
					</div> --> <label class="input-box"> <span>Usuario</span> <input type="text" placeholder="@curvysweet (no obligatorio)"> </label> <label class="input-box"> <span>Email</span> <input name="mail" type="email" placeholder="correo electronico" required> </label> <label class="input-box"> <span>Contrasena</span> <input name="password" type="password" placeholder="********" required> </label> <div class="remember-forgot"> <label class="remember-option"> <input type="checkbox"> <span>Recordarme</span> </label> <a href="#">Has olvidado tu contrasena?</a> </div> <button type="submit" class="btn">Entrar</button> <p class="form-message" data-login-message aria-live="polite"></p> <div class="register-link"> <span>Aun no tienes cuenta?</span> <button type="button" class="text-link" data-auth-target="register">
Crear perfil
</button> </div> </form> <form class="login-form auth-panel" data-auth-panel="register" aria-hidden="true" method="POST" action="/api/register"> <div class="input-grid"> <label class="input-box"> <span>Nombre</span> <input name="name" type="text" placeholder="Tu nombre" required> </label> <label class="input-box"> <span>Apellido</span> <input name="lastName" type="text" placeholder="Tu apellido" required> </label> </div> <label class="input-box"> <span>Usuario</span> <input name="username" type="text" placeholder="@nuevo_perfil" required> </label> <label class="input-box"> <span>Email</span> <input name="mail" type="email" placeholder="correo electronico" required> </label> <div class="input-grid"> <label class="input-box"> <span>Contrasena</span> <input name="password" type="password" placeholder="********" required> </label> <label class="input-box"> <span>Repetir contrasena</span> <input name="repeatPassword" type="password" placeholder="********" required> </label> </div> <label class="remember-option remember-policy"> <input type="checkbox"> <span>Acepto los terminos y la politica de privacidad</span> </label> <button type="submit" class="btn">Crear cuenta</button> <p class="form-message" data-register-message aria-live="polite"></p> <div class="register-link"> <span>Ya tienes cuenta?</span> <button type="button" class="text-link" data-auth-target="login">
Entrar aqui
</button> </div> </form> </div> </div> </div> </section> <button id="theme-toggle" type="button">Modo oscuro</button> ${renderScript($$result, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/conf_login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/components/conf_login.astro", void 0);

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Login</title>${renderHead()}</head> <body> ${renderComponent($$result, "Login_page", $$ConfLogin, {})} </body></html>`;
}, "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/login.astro", void 0);

const $$file = "C:/Users/Usuario/Escritorio/CurvySweet Project/zapping-zero/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Login,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
