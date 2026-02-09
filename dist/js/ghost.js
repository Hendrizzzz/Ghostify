(function () {
    'use strict';

    let CONFIG = {
        version: "0.0.0",
        killSwitch: [],
        patterns: {
            igTyping: [], igSeen: [], igStory: [],
            msgTyping: [], msgSeen: [], msgStory: []
        }
    };

    let SETTINGS = {
        igTyping: true, igSeen: true, igStory: true,
        msgTyping: true, msgSeen: true, msgStory: true
    };

    const isDebugMode = () => localStorage.getItem('GHOSTIFY_DEBUG') === 'true';


    const isInstagram = window.location.hostname.includes('instagram.com');
    const isMessenger = window.location.hostname.includes('messenger.com') ||
        window.location.hostname.includes('facebook.com');


    if (isMessenger) {
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


    window.addEventListener('message', (event) => {
        if (event.source !== window) return;

        if (event.data.type === 'GHOSTIFY_CONFIG_UPDATE') {
            CONFIG = event.data.config;
            if (isDebugMode()) console.log('👻 Config Updated:', CONFIG);
        }

        if (event.data.type === 'GHOSTIFY_SETTINGS_UPDATE') {
            SETTINGS = event.data.settings;
            if (isDebugMode()) console.log('👻 Settings Updated:', SETTINGS);
        }
    });



    function decode(data) {
        if (!data) return '';
        try {
            if (typeof data === 'string') return data;
            if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
                return new TextDecoder().decode(data);
            }
            if (typeof data === 'object') return JSON.stringify(data);
        } catch (e) { return ''; }
        return '';
    }


    function isKilled(featureKey) {
        return CONFIG.killSwitch && CONFIG.killSwitch.includes(featureKey);
    }


    function matchesPattern(str, patternList) {
        if (!patternList || !Array.isArray(patternList)) return false;

        return patternList.some(pattern => {
            if (pattern.includes('|') || pattern.startsWith('^') || pattern.endsWith('$')) {
                try {
                    const regex = new RegExp(pattern, 'i');
                    return regex.test(str);
                } catch (e) { return false; }
            }
            return str.toLowerCase().includes(pattern.toLowerCase());
        });
    }


    function shouldBlock(data, url = '') {
        if (url.match(/\.(mp4|jpg|png|webp|gif|mp3|wav)$/i)) return null;

        if (data && data.byteLength && data.byteLength > 5000) return null;

        const str = (decode(data) + ' ' + url).toLowerCase();

        if (isDebugMode()) {
            if (str.includes('seen') || str.includes('read') || str.includes('typing') || str.includes('presence')) {
                console.groupCollapsed('🕵️ Ghostify Inspector');
                console.log('URL:', url);
                console.log('Payload:', str.substring(0, 5000) + (str.length > 5000 ? '...' : ''));
                console.groupEnd();
            }
        }

        if (isMessenger) {
            if (str.includes('delivery_receipt')) return null;

            if (SETTINGS.msgTyping && !isKilled('msgTyping') && matchesPattern(str, CONFIG.patterns.msgTyping)) {
                return 'MSG_TYPING';
            }
            if (SETTINGS.msgStory && !isKilled('msgStory') && matchesPattern(str, CONFIG.patterns.msgStory)) {
                return 'MSG_STORY';
            }
            if (SETTINGS.msgSeen && !isKilled('msgSeen') && matchesPattern(str, CONFIG.patterns.msgSeen)) {
                return 'MSG_SEEN';
            }
            return null;
        }

        if (isInstagram) {
            if (str.includes('cursor') || url.includes('cursor')) {
                return null;
            }

            if (str.includes('query_hash') || (str.includes('doc_id') && !str.includes('mutation'))) {
                return null;
            }

            if (SETTINGS.igTyping && !isKilled('igTyping') && matchesPattern(str, CONFIG.patterns.igTyping)) {
                return 'IG_TYPING';
            }
            if (SETTINGS.igStory && !isKilled('igStory') && matchesPattern(str, CONFIG.patterns.igStory)) {
                return 'IG_STORY';
            }
            if (SETTINGS.igSeen && !isKilled('igSeen') && matchesPattern(str, CONFIG.patterns.igSeen)) {
                return 'IG_SEEN';
            }
            return null;
        }

        return null;
    }



    let isScrolling = false;
    let scrollTimeout = null;

    window.addEventListener('scroll', () => {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 500);
    }, true);

    function shouldSpoofVisibility() {
        if (isMessenger && SETTINGS.msgSeen && !isKilled('msgSeen')) {
            return 'unfocused';
        }

        if (isInstagram && SETTINGS.igSeen && !isKilled('igSeen')) {
            const path = window.location.pathname;
            if (path.includes('/direct/t/')) {
                if (isScrolling) {
                    return false;
                }
                return 'hidden';
            }
        }

        return false;
    }

    const originalHasFocus = document.hasFocus.bind(document);

    Object.defineProperty(document, 'hasFocus', {
        value: function () {
            const spoof = shouldSpoofVisibility();
            if (spoof === 'hidden' || spoof === 'unfocused') return false;
            return originalHasFocus();
        }
    });

    Object.defineProperty(document, 'visibilityState', {
        get: function () {
            const spoof = shouldSpoofVisibility();
            if (spoof === 'hidden') return 'hidden';
            return 'visible';
        }
    });

    Object.defineProperty(document, 'hidden', {
        get: function () {
            const spoof = shouldSpoofVisibility();
            if (spoof === 'hidden') return true;
            return false;
        }
    });

    const origAddEvt = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, opt) {
        if (['visibilitychange', 'webkitvisibilitychange', 'blur', 'focus'].includes(type)) {
            const wrappedListener = function (e) {
                const spoof = shouldSpoofVisibility();
                if (spoof) return;
                return listener.call(this, e);
            };
            return origAddEvt.call(this, type, wrappedListener, opt);
        }
        return origAddEvt.call(this, type, listener, opt);
    };



    const OriginalWebSocket = window.WebSocket;
    const originalWSSend = OriginalWebSocket.prototype.send;

    OriginalWebSocket.prototype.send = function (data) {
        const blockType = shouldBlock(data);
        if (blockType) {
            if (isDebugMode()) console.log(`🚫 [${blockType}] WS Blocked`);
            return;
        }
        return originalWSSend.apply(this, arguments);
    };

    window.WebSocket = function (url, protocols) {
        const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);
        const boundSend = ws.send.bind(ws);
        ws.send = function (data) {
            const blockType = shouldBlock(data);
            if (blockType) {
                if (isDebugMode()) console.log(`🚫 [${blockType}] WS Blocked`);
                return;
            }
            return boundSend(data);
        };
        return ws;
    };
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    Object.assign(window.WebSocket, OriginalWebSocket);

    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
        const url = typeof input === 'string' ? input : (input?.url || '');
        const body = init?.body || '';
        const blockType = shouldBlock(body, url);
        if (blockType) {
            if (isDebugMode()) console.log(`🚫 [${blockType}] Fetch Blocked`);
            return new Response('{"status":"ok"}', {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return originalFetch.apply(this, arguments);
    };

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._ghostifyUrl = url;
        return originalXhrOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        const blockType = shouldBlock(body, this._ghostifyUrl || '');
        if (blockType) {
            if (isDebugMode()) console.log(`🚫 [${blockType}] XHR Blocked`);
            return;
        }
        return originalXhrSend.apply(this, arguments);
    };

    const originalBeacon = navigator.sendBeacon;
    navigator.sendBeacon = function (url, data) {
        const blockType = shouldBlock(data, url);
        if (blockType) {
            if (isDebugMode()) console.log(`🚫 [${blockType}] Beacon Blocked`);
            return true;
        }
        return originalBeacon.apply(this, arguments);
    };


    console.log('👻 Ghostify v1.0.2 Active');
    if (isDebugMode()) {
        console.log('👻 Ghostify Active - Debug Mode ON');
        console.log('   To disable: localStorage.removeItem("GHOSTIFY_DEBUG")');
    }

})();
