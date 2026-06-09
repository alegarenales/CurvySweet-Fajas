// @ts-check
import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel";

function curvySweetDevToolbar() {
    return {
        name: 'curvysweet-dev-toolbar',
        hooks: {
            'astro:config:setup': ({ command, addDevToolbarApp, injectScript }) => {
                // Mueve la notificación de "sitio en pruebas" al bloque de desarrollo

                if (command !== 'dev') {
                    return;
                }

                // Inyectar aviso de entorno de desarrollo (solo en `astro dev`).
                injectScript('page', `
                    const TEST_NOTICE_KEY = 'curvysweetTestNoticeDismissed';

                    const showTestNotice = () => {
                    if (!sessionStorage.getItem(TEST_NOTICE_KEY) && !document.querySelector('[data-test-notice]')) {
                        const notice = document.createElement('aside');
                        notice.dataset.testNotice = '';
                        notice.setAttribute('role', 'status');
                        notice.innerHTML = '<strong>Sitio en pruebas</strong><span>Esta página puede presentar fallos.</span><button type="button" aria-label="Cerrar aviso">×</button>';
                        notice.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483646;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;max-width:900px;margin:auto;padding:13px 14px;border:1px solid rgba(255,166,0,.48);border-radius:8px;background:#19150d;color:#fff4d6;box-shadow:0 16px 44px rgba(0,0,0,.28);font:600 14px/1.4 system-ui,sans-serif';
                        notice.querySelector('span').style.color = '#e4d4aa';
                        const closeButton = notice.querySelector('button');
                        closeButton.style.cssText = 'width:32px;height:32px;border:0;border-radius:50%;background:#33291a;color:#fff4d6;font-size:20px;cursor:pointer';
                        closeButton.addEventListener('click', () => {
                            sessionStorage.setItem(TEST_NOTICE_KEY, 'true');
                            notice.remove();
                        });
                        document.body.append(notice);
                    }
                    };

                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', showTestNotice, { once: true });
                    } else {
                        showTestNotice();
                    }
                `);

                addDevToolbarApp({
                    id: 'curvysweet:admin',
                    name: 'CurvySweet',
                    icon: 'gear',
                    entrypoint: new URL('./src/dev-toolbar/curvysweet-admin.js', import.meta.url),
                });

                injectScript('page', `
                    const canUseCurvySweetToolbar = () => {
                        try {
                            return JSON.parse(localStorage.getItem('curvysweetUser') || 'null')?.isAdmin === true;
                        } catch {
                            return false;
                        }
                    };

                    const syncCurvySweetToolbarVisibility = () => {
                        document.querySelectorAll('astro-dev-toolbar').forEach((toolbar) => {
                            toolbar.style.display = canUseCurvySweetToolbar() ? '' : 'none';
                        });
                    };

                    syncCurvySweetToolbarVisibility();

                    new MutationObserver(syncCurvySweetToolbarVisibility).observe(document.documentElement, {
                        childList: true,
                        subtree: true,
                    });

                    window.addEventListener('storage', syncCurvySweetToolbarVisibility);
                `);
            },
        },
    };
}

// https://astro.build/config
export default defineConfig({
    output: 'server',
    devToolbar: {
        enabled: true,
    },
    integrations: [curvySweetDevToolbar()],
    adapter: vercel(),
    site: 'https://curvysweet.com',
        
});
