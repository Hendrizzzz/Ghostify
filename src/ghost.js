// src/ghost.js
import { isMessenger, isDebugMode, KILLED_FEATURES, SETTINGS } from './config.js';
import { updatePatterns } from './utils/network.js';
import { hookWebSocket } from './core/interceptors/websocket.js';
import { hookFetch } from './core/interceptors/fetch.js';
import { hookXHR } from './core/interceptors/xhr.js';
import { hookVisibility } from './core/interceptors/focus.js';
import { startFacebookProtection } from './platforms/facebook.js';
import { startInstagramProtection } from './platforms/instagram.js';

(function () {
    'use strict';

    if (isMessenger) {
        // Unregister service workers to prevent push-notification based read receipts
        if (navigator.serviceWorker) {
            navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(r => r.unregister());
            });
            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    register: () => new Promise(() => { }),
                    getRegistrations: () => Promise.resolve([]),
                    ready: new Promise(() => { })
                }
            });
        }
    }

    // Listen for extension config updates from Background/Content scripts
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;

        if (event.data.type === 'GHOSTIFY_CONFIG_UPDATE') {
            const CONFIG = event.data.config;
            updatePatterns(CONFIG.patterns);

            KILLED_FEATURES.clear();
            if (CONFIG.killSwitch) {
                CONFIG.killSwitch.forEach(f => KILLED_FEATURES.add(f));
            }
            if (isDebugMode()) console.log('👻 Config Updated:', CONFIG);
        }

        if (event.data.type === 'GHOSTIFY_SETTINGS_UPDATE') {
            Object.assign(SETTINGS, event.data.settings);
            if (isDebugMode()) console.log('👻 Settings Updated:', SETTINGS);
        }
    });

    // Initialize Global Interceptors
    hookVisibility();
    hookWebSocket();
    hookFetch();
    hookXHR();

    // Initialize Site-Specific Observers
    startFacebookProtection();
    startInstagramProtection();

    console.log('👻 Ghostify v2.0 Modular Core Active');
    if (isDebugMode()) {
        console.log('👻 Ghostify Active - Debug Mode ON');
        console.log('   To disable: localStorage.removeItem("GHOSTIFY_DEBUG")');
    }

})();
