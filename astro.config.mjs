// @ts-check
import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

function curvySweetDevToolbar() {
    return {
        name: 'curvysweet-dev-toolbar',
        hooks: {
            'astro:config:setup': ({ command, addDevToolbarApp, injectScript }) => {
                if (command !== 'dev') {
                    return;
                }

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
    adapter: node({
        mode: 'standalone',
    }),
    site: 'https://curvysweet.com',
        
});
