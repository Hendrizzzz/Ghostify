(function () {
    'use strict';

    // ============================================================
    // 1. SERVICE WORKER ASSASSIN (Restored from the working version)
    // ============================================================
    // This stops Messenger from sending "Seen" via background threads.
    if (window.location.hostname.includes('messenger.com') || window.location.hostname.includes('facebook.com')) {
        if (navigator.serviceWorker) {
            // Kill existing
            navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(r => {
                    console.log('💀 Ghostify: Killing Service Worker', r);
                    r.unregister();
                });
            });
            // Block new ones
            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    register: () => new Promise(() => { }),
                    getRegistrations: () => Promise.resolve([]),
                    ready: new Promise(() => { })
                }
            });
        }
    }

    let SETTINGS = {
        igTyping: true, igSeen: true, igStory: true,
        msgTyping: false, msgSeen: true, msgStory: true
    };

    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data.type === 'GHOSTIFY_INIT' || event.data.type === 'GHOSTIFY_UPDATE') {
            SETTINGS = event.data.settings;
            console.log('👻 Ghostify settings updated:', SETTINGS);
        }
    });

    const isInstagram = window.location.hostname.includes('instagram.com');
    const isMessenger = window.location.hostname.includes('messenger.com') ||
        window.location.hostname.includes('facebook.com');

    // ============================================================
    // IG VISIBILITY LOGIC (LOCKED - V2.0.2)
    // ============================================================
    function shouldSpoofVisibility() {
        if (isInstagram && SETTINGS.igSeen) {
            const path = window.location.pathname;
            if (path.includes('/stories/') || path.includes('/reel')) {
                return false;
            }
            return true;
        }
        // FB: DO NOT SPOOF. Breaks Feed.
        return false;
    }

    const TYPING_PATTERNS = [
        'indicate_activity',
        'typing_indicator',
        'activity_indicator',
        'is_typing'
    ];

    const IG_SEEN_PATTERNS = [
        'mark_read', 'mark_seen', 'thread_seen',
        'DirectMarkAsSeen', 'MarkAsSeen',
        'DirectThreadMarkItemsSeen',
        'PolarisDirectMarkAsSeenMutation',
        'DirectSeenMutation', 'updateLastSeenAt',
        'last_activity_at'
    ];

    const IG_STORY_PATTERNS = [
        'StoriesUpdateSeenMutation', 'PolarisStoriesSeenMutation',
        'usePolarisStoriesV3SeenMutation', 'reelMediaSeen',
        'storiesUpdateSeen', 'SeenStoriesUpdateMutation',
        'mark_story_seen', 'update_seen_for_reel',
        'SeenMutation', 'reel_seen', 'media_seen', 'reel_media',
        'seen_at', 'storiesSeen', 'stories_update_seen',
        'mark_story_read', 'stories_viewer_stat_mutation'
    ];

    // ============================================================
    // FACEBOOK PATTERNS (V2.1.6 - Toxic Whitelist Logic)
    // ============================================================
    const FB_SEEN_PATTERNS = [
        'mark_read', 'mark_seen', 'seen_state', 'thread_seen',
        'DirectMarkAsSeen', 'MarkAsSeen', '"label":"3"', '"label":"5"',
        'viewed_state', 'last_activity_at', 'read_receipt'
        // REMOVED: 'delivery_receipt' (Handled manually below)
    ];

    const FB_STORY_PATTERNS = [
        'stories_update_seen', 'storiesseen', 'story_view',
        'stories_viewer_stat_mutation', 'mutation_token', 'update_seen', 'viewed',
        'story_view_receipt',
        'StoriesUpdateSeenMutation', 'PolarisStoriesSeenMutation',
        'usePolarisStoriesV3SeenMutation', 'reelMediaSeen',
        'storiesUpdateSeen', 'SeenStoriesUpdateMutation',
        'mark_story_seen', 'update_seen_for_reel',
        'SeenMutation', 'reel_seen', 'media_seen', 'reel_media'
    ];

    function decode(data) {
        if (!data) return '';
        try {
            if (typeof data === 'string') return data;
            if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
                return new TextDecoder().decode(data);
            }
            if (typeof data === 'object') return JSON.stringify(data);
        } catch (e) {
            return '';
        }
        return '';
    }

    function shouldBlock(data, url = '') {
        if (url.includes('.mp4') || url.includes('.jpg') ||
            url.includes('.png') || url.includes('.webp')) {
            return null;
        }

        const str = (decode(data) + ' ' + url).toLowerCase();

        // ============================================================
        // FACEBOOK / MESSENGER LOGIC (V2.1.6)
        // ============================================================
        if (isMessenger) {
            // 1. CHECK BLOCK LISTS FIRST (Priority)
            if (SETTINGS.msgStory && FB_STORY_PATTERNS.some(p => str.includes(p.toLowerCase()))) return 'MSG_STORY';
            if (SETTINGS.msgSeen && FB_SEEN_PATTERNS.some(p => str.includes(p.toLowerCase()))) return 'MSG_SEEN';

            // 2. THE TOXIC WHITELIST (Delivery Receipt)
            // Allows feed to load, but blocks if it contains ANY hidden seen receipt pattern.
            // V2.1.8 Fix: Check against FULL list, not just mark_read.
            if (str.includes('delivery_receipt')) {
                if (SETTINGS.msgSeen && FB_SEEN_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
                    return 'MSG_SEEN (Toxic Delivery)';
                }
                return null; // Safe to allow (Pure Delivery)
            }

            // 3. FEED WHITELIST
            if (str.includes('pagination') || str.includes('cursor') || str.includes('feed')) return null;

            if (SETTINGS.msgTyping && TYPING_PATTERNS.some(p => str.includes(p))) return 'MSG_TYPING';
            return null;
        }

        // ============================================================
        // INSTAGRAM LOGIC (LOCKED V2.0.2)
        // ============================================================
        if (str.includes('query_hash') || (str.includes('doc_id') && !str.includes('mutation'))) return null;

        if (TYPING_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igTyping) return 'IG_TYPING';
            return null;
        }

        if (IG_STORY_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igStory) return 'IG_STORY';
            return null;
        }

        if (IG_SEEN_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igSeen) return 'IG_SEEN';
            return null;
        }

        return null;
    }

    // ============================================================
    // VISIBILITY SPOOFING
    // ============================================================

    const originalHasFocus = document.hasFocus.bind(document);
    Object.defineProperty(document, 'hasFocus', {
        value: function () {
            if (shouldSpoofVisibility()) return false;
            return originalHasFocus();
        }
    });

    Object.defineProperty(document, 'visibilityState', {
        get: function () {
            if (shouldSpoofVisibility()) return 'hidden';
            return 'visible';
        }
    });

    Object.defineProperty(document, 'hidden', {
        get: function () {
            if (shouldSpoofVisibility()) return true;
            return false;
        }
    });

    const origAddEvt = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, opt) {
        if (['visibilitychange', 'blur', 'focus'].includes(type)) {
            const wrappedListener = function (e) {
                if (shouldSpoofVisibility()) return;
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
            console.log(`🚫 [${blockType}]`);
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
                console.log(`🚫 [${blockType}]`);
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
            console.log(`🚫 [${blockType}]`);
            return new Response('{"status":"ok"}', { status: 200, headers: { 'Content-Type': 'application/json' } });
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
        const blockType = shouldBlock(body, this._ghostifyUrl);
        if (blockType) {
            console.log(`🚫 [${blockType}]`);
            return;
        }
        return originalXhrSend.apply(this, arguments);
    };

    const originalBeacon = navigator.sendBeacon;

    navigator.sendBeacon = function (url, data) {
        const blockType = shouldBlock(data, url);
        if (blockType) {
            console.log(`🚫 [${blockType}]`);
            return true;
        }
        return originalBeacon.apply(this, arguments);
    };

    console.log('👻 Ghostify v2.1.8 Active - Comprehensive Toxic Check');

})();
