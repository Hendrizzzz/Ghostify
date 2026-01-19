(function () {
    'use strict';

    // ============================================================
    // SETTINGS
    // ============================================================
    let SETTINGS = {
        igTyping: true, igSeen: true, igStory: true,
        msgTyping: false, msgSeen: true, msgStory: true
    };

    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data.type === 'GHOSTIFY_INIT' || event.data.type === 'GHOSTIFY_UPDATE') {
            SETTINGS = event.data.settings;
            console.log("👻 Settings:", SETTINGS);
        }
    });

    const isInstagram = window.location.hostname.includes('instagram.com');
    const isMessenger = window.location.hostname.includes('messenger.com') || window.location.hostname.includes('facebook.com');

    // ============================================================
    // V32 PATTERNS (proven to work)
    // ============================================================

    const TYPING_PATTERNS = [
        'indicate_activity',
        'typing_indicator',
        'activity_indicator',
        'is_typing'
    ];

    const SEEN_PATTERNS = [
        'mark_read',
        'mark_seen',
        'seen_state',
        'thread_seen',
        'DirectMarkAsSeen',
        'MarkAsSeen',
        'DirectThreadMarkItemsSeen',
        'PolarisDirectMarkAsSeenMutation',
        'DirectSeenMutation',
        'seenByViewer',
        'updateLastSeenAt',
        '"label":"3"',
        '"label":"5"',
        'viewed_state',
        'last_activity_at'
    ];

    const STORY_PATTERNS = [
        'StoriesUpdateSeenMutation',
        'PolarisStoriesSeenMutation',
        'usePolarisStoriesV3SeenMutation',
        'reelMediaSeen',
        'storiesUpdateSeen',
        'SeenStoriesUpdateMutation',
        'mark_story_seen',
        'update_seen_for_reel',
        'SeenMutation',
        'reel_seen',
        'media_seen',
        'reel_media',
        'seen_at',
        'viewer_seen',
        'storiesSeen',
        'stories_update_seen',
        'mark_story_read',
        'stories_viewer_stat_mutation'
    ];

    // ============================================================
    // HELPERS
    // ============================================================

    function decode(data) {
        if (!data) return "";
        try {
            if (typeof data === 'string') return data;
            if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
                return new TextDecoder().decode(data);
            }
            if (typeof data === 'object') return JSON.stringify(data);
        } catch (e) { return ""; }
        return "";
    }

    function shouldBlock(data, url = "") {
        if (url.includes('.mp4') || url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) {
            return null;
        }

        const str = (decode(data) + " " + url).toLowerCase();

        // TYPING - Only IG
        if (TYPING_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igTyping) return "IG_TYPING";
            return null;
        }

        // STORY - Check before SEEN (more specific patterns)
        if (STORY_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igStory) return "IG_STORY";
            if (isMessenger && SETTINGS.msgStory) return "MSG_STORY";
            return null;
        }

        // SEEN
        if (SEEN_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igSeen) return "IG_SEEN";
            if (isMessenger && SETTINGS.msgSeen) return "MSG_SEEN";
            return null;
        }

        return null;
    }

    // ============================================================
    // DYNAMIC VISIBILITY SPOOFING
    // Only spoof when SEEN features are ON
    // ============================================================

    const originalHasFocus = document.hasFocus.bind(document);
    Object.defineProperty(document, 'hasFocus', {
        value: function () {
            // If any SEEN feature is ON, spoof as unfocused
            if (isInstagram && SETTINGS.igSeen) return false;
            if (isMessenger && SETTINGS.msgSeen) return false;
            // Otherwise, return real focus state
            return originalHasFocus();
        }
    });

    const origAddEvt = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, opt) {
        if (['visibilitychange', 'blur', 'focus'].includes(type)) {
            // Wrap listener to conditionally block
            const wrappedListener = function (e) {
                const seenOn = (isInstagram && SETTINGS.igSeen) || (isMessenger && SETTINGS.msgSeen);
                if (seenOn) return; // Block event when seen is ON
                return listener.call(this, e);
            };
            return origAddEvt.call(this, type, wrappedListener, opt);
        }
        return origAddEvt.call(this, type, listener, opt);
    };

    // ============================================================
    // NETWORK INTERCEPTORS (V32 exact)
    // ============================================================

    const OrigWS = window.WebSocket;
    const origSend = OrigWS.prototype.send;
    OrigWS.prototype.send = function (data) {
        const blockType = shouldBlock(data);
        if (blockType) {
            console.log(`🚫 [${blockType}]`);
            return;
        }
        return origSend.apply(this, arguments);
    };

    window.WebSocket = function (url, proto) {
        const ws = proto ? new OrigWS(url, proto) : new OrigWS(url);
        const send = ws.send.bind(ws);
        ws.send = function (data) {
            const blockType = shouldBlock(data);
            if (blockType) {
                console.log(`🚫 [${blockType}]`);
                return;
            }
            return send(data);
        };
        return ws;
    };
    window.WebSocket.prototype = OrigWS.prototype;
    Object.assign(window.WebSocket, OrigWS);

    const origFetch = window.fetch;
    window.fetch = async function (input, init) {
        let url = typeof input === 'string' ? input : (input?.url || "");
        let body = init?.body || "";
        const blockType = shouldBlock(body, url);
        if (blockType) {
            console.log(`🚫 [${blockType}]`);
            return new Response('{"status":"ok"}', { status: 200 });
        }
        return origFetch.apply(this, arguments);
    };

    const xhrOpen = XMLHttpRequest.prototype.open;
    const xhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
        this._ghostUrl = url;
        return xhrOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
        const blockType = shouldBlock(body, this._ghostUrl);
        if (blockType) {
            console.log(`🚫 [${blockType}]`);
            return;
        }
        return xhrSend.apply(this, arguments);
    };

    const origBeacon = navigator.sendBeacon;
    navigator.sendBeacon = function (url, data) {
        const blockType = shouldBlock(data, url);
        if (blockType) {
            console.log(`🚫 [${blockType}]`);
            return true;
        }
        return origBeacon.apply(this, arguments);
    };

    console.log("👻 Ghostify V14 Active");

})();
