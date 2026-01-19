/**
 * @fileoverview Ghostify - Privacy control for Instagram & Messenger
 * @description Main interception script that runs in the MAIN world to access
 *              page JavaScript context and intercept network requests.
 * @version 2.0.0
 * @license MIT
 */

(function () {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================

    /**
     * User settings received from the popup via content.js bridge.
     * @type {Object}
     */
    let SETTINGS = {
        igTyping: true,
        igSeen: true,
        igStory: true,
        msgTyping: false,
        msgSeen: true,
        msgStory: true
    };

    // Listen for settings from the content.js bridge
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data.type === 'GHOSTIFY_INIT' || event.data.type === 'GHOSTIFY_UPDATE') {
            SETTINGS = event.data.settings;
            console.log('👻 Ghostify settings updated:', SETTINGS);
        }
    });

    /** @type {boolean} Whether current page is Instagram */
    const isInstagram = window.location.hostname.includes('instagram.com');

    /** @type {boolean} Whether current page is Messenger/Facebook */
    const isMessenger = window.location.hostname.includes('messenger.com') ||
        window.location.hostname.includes('facebook.com');

    // ============================================================
    // PATTERN DEFINITIONS
    // These patterns have been tested and proven to work.
    // Do not modify unless Meta changes their API.
    // ============================================================

    /**
     * Patterns that indicate typing activity (Instagram only).
     * Messenger uses encrypted protocol that cannot be intercepted.
     * @constant {string[]}
     */
    const TYPING_PATTERNS = [
        'indicate_activity',
        'typing_indicator',
        'activity_indicator',
        'is_typing'
    ];

    /**
     * Patterns that indicate read receipts for direct messages.
     * @constant {string[]}
     */
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

    /**
     * Patterns that indicate story view receipts.
     * @constant {string[]}
     */
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
    // HELPER FUNCTIONS
    // ============================================================

    /**
     * Decodes various data types to a string for pattern matching.
     * @param {string|ArrayBuffer|Blob|Object} data - Data to decode
     * @returns {string} Decoded string representation
     */
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

    /**
     * Determines if a request should be blocked based on its content.
     * @param {*} data - Request body data
     * @param {string} url - Request URL
     * @returns {string|null} Block type if should block, null if should allow
     */
    function shouldBlock(data, url = '') {
        // Allow media files to load (prevents grey screen issues)
        if (url.includes('.mp4') || url.includes('.jpg') ||
            url.includes('.png') || url.includes('.webp')) {
            return null;
        }

        const str = (decode(data) + ' ' + url).toLowerCase();

        // Check TYPING patterns (Instagram only)
        if (TYPING_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igTyping) return 'IG_TYPING';
            return null;
        }

        // Check STORY patterns (more specific, check before SEEN)
        if (STORY_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igStory) return 'IG_STORY';
            if (isMessenger && SETTINGS.msgStory) return 'MSG_STORY';
            return null;
        }

        // Check SEEN patterns
        if (SEEN_PATTERNS.some(p => str.includes(p.toLowerCase()))) {
            if (isInstagram && SETTINGS.igSeen) return 'IG_SEEN';
            if (isMessenger && SETTINGS.msgSeen) return 'MSG_SEEN';
            return null;
        }

        return null;
    }

    // ============================================================
    // VISIBILITY SPOOFING
    // Tricks the page into thinking the tab is not focused,
    // which helps prevent automatic read receipts.
    // ============================================================

    const originalHasFocus = document.hasFocus.bind(document);

    Object.defineProperty(document, 'hasFocus', {
        value: function () {
            // Return false (unfocused) when SEEN blocking is enabled
            if (isInstagram && SETTINGS.igSeen) return false;
            if (isMessenger && SETTINGS.msgSeen) return false;
            return originalHasFocus();
        }
    });

    const origAddEvt = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (type, listener, opt) {
        if (['visibilitychange', 'blur', 'focus'].includes(type)) {
            const wrappedListener = function (e) {
                const seenOn = (isInstagram && SETTINGS.igSeen) ||
                    (isMessenger && SETTINGS.msgSeen);
                if (seenOn) return; // Block visibility events when SEEN is ON
                return listener.call(this, e);
            };
            return origAddEvt.call(this, type, wrappedListener, opt);
        }
        return origAddEvt.call(this, type, listener, opt);
    };

    // ============================================================
    // NETWORK INTERCEPTORS
    // Patch all methods that can send data to the server.
    // ============================================================

    // --- WebSocket Interception ---
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

    // --- Fetch API Interception ---
    const originalFetch = window.fetch;

    window.fetch = async function (input, init) {
        const url = typeof input === 'string' ? input : (input?.url || '');
        const body = init?.body || '';

        const blockType = shouldBlock(body, url);
        if (blockType) {
            console.log(`🚫 [${blockType}]`);
            return new Response('{"status":"ok"}', { status: 200 });
        }

        return originalFetch.apply(this, arguments);
    };

    // --- XMLHttpRequest Interception ---
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

    // --- Beacon API Interception ---
    const originalBeacon = navigator.sendBeacon;

    navigator.sendBeacon = function (url, data) {
        const blockType = shouldBlock(data, url);
        if (blockType) {
            console.log(`🚫 [${blockType}]`);
            return true;
        }
        return originalBeacon.apply(this, arguments);
    };

    // ============================================================
    // INITIALIZATION
    // ============================================================

    console.log('👻 Ghostify v2.0.0 Active');

})();
