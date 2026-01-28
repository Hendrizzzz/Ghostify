

(function () {
    'use strict';
    if (window.location.hostname.includes('messenger.com') || window.location.hostname.includes('facebook.com')) {
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

    const IG_TYPING_PATTERNS = ['indicate_activity', 'typing_indicator', 'activity_indicator', 'is_typing'];
    const IG_SEEN_PATTERNS = ['mark_read', 'mark_seen', 'thread_seen', 'DirectMarkAsSeen', 'MarkAsSeen', 'DirectThreadMarkItemsSeen', 'PolarisDirectMarkAsSeenMutation', 'DirectSeenMutation', 'updateLastSeenAt', 'last_activity_at'];
    const IG_STORY_PATTERNS = ['StoriesUpdateSeenMutation', 'PolarisStoriesSeenMutation', 'usePolarisStoriesV3SeenMutation', 'reelMediaSeen', 'storiesUpdateSeen', 'SeenStoriesUpdateMutation', 'mark_story_seen', 'update_seen_for_reel', 'SeenMutation', 'reel_seen', 'media_seen', 'reel_media', 'seen_at', 'storiesSeen', 'stories_update_seen', 'mark_story_read', 'stories_viewer_stat_mutation'];
    const MSG_TYPING_PATTERNS = ['indicate_activity', 'typing_indicator', 'activity_indicator', 'is_typing'];
    const MSG_SEEN_PATTERNS = ['mark_read', 'mark_seen', 'seen_state', 'thread_seen', 'DirectMarkAsSeen', 'MarkAsSeen', 'DirectThreadMarkItemsSeen', 'PolarisDirectMarkAsSeenMutation', 'DirectSeenMutation', 'seenByViewer', 'updateLastSeenAt', '"label":"3"', '"label":"5"', 'viewed_state', 'last_activity_at'];
    const MSG_STORY_PATTERNS = ['StoriesUpdateSeenMutation', 'PolarisStoriesSeenMutation', 'usePolarisStoriesV3SeenMutation', 'reelMediaSeen', 'storiesUpdateSeen', 'SeenStoriesUpdateMutation', 'mark_story_seen', 'update_seen_for_reel', 'SeenMutation', 'reel_seen', 'media_seen', 'reel_media', 'seen_at', 'viewer_seen', 'storiesSeen', 'stories_update_seen', 'mark_story_read', 'stories_viewer_stat_mutation'];

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


    function shouldBlock(data, url = '') {
        if (url.includes('.mp4') || url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) return null;

        const str = (decode(data) + ' ' + url).toLowerCase();

        if (isMessenger) {
            if (SETTINGS.msgTyping && MSG_TYPING_PATTERNS.some(p => str.includes(p.toLowerCase()))) return 'MSG_TYPING';
            if (SETTINGS.msgStory && MSG_STORY_PATTERNS.some(p => str.includes(p.toLowerCase()))) return 'MSG_STORY';
            if (SETTINGS.msgSeen && MSG_SEEN_PATTERNS.some(p => str.includes(p.toLowerCase()))) return 'MSG_SEEN';
            return null;
        }

        if (isInstagram) {
            if (str.includes('query_hash') || (str.includes('doc_id') && !str.includes('mutation'))) return null;
            if (SETTINGS.igTyping && IG_TYPING_PATTERNS.some(p => str.includes(p.toLowerCase()))) return 'IG_TYPING';
            if (SETTINGS.igStory && IG_STORY_PATTERNS.some(p => str.includes(p.toLowerCase()))) return 'IG_STORY';
            if (SETTINGS.igSeen && IG_SEEN_PATTERNS.some(p => str.includes(p.toLowerCase()))) return 'IG_SEEN';
            return null;
        }

        return null;
    }

    function shouldSpoofIG() {
        if (isInstagram && SETTINGS.igSeen) {
            const path = window.location.pathname;
            if (path.includes('/stories/') || path.includes('/reel')) return false;
            return true;
        }
        return false;
    }

    const originalHasFocus = document.hasFocus.bind(document);

    Object.defineProperty(document, 'hasFocus', {
        value: function () {
            if (shouldSpoofIG()) return false;
            if (isMessenger && SETTINGS.msgSeen) return false;
            return originalHasFocus();
        }
    });

    Object.defineProperty(document, 'visibilityState', {
        get: function () {
            if (shouldSpoofIG()) return 'hidden';
            return 'visible';
        }
    });

    Object.defineProperty(document, 'hidden', {
        get: function () {
            if (shouldSpoofIG()) return true;
            return false;
        }
    });

    const origAddEvt = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, opt) {
        if (['visibilitychange', 'blur', 'focus'].includes(type)) {
            const wrappedListener = function (e) {
                const seenOn = (isInstagram && SETTINGS.igSeen) || (isMessenger && SETTINGS.msgSeen);
                if (seenOn) return;
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
        if (blockType) { console.log(`🚫 [${blockType}] WS Blocked`); return; }
        return originalWSSend.apply(this, arguments);
    };

    window.WebSocket = function (url, protocols) {
        const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);
        const boundSend = ws.send.bind(ws);
        ws.send = function (data) {
            const blockType = shouldBlock(data);
            if (blockType) { console.log(`🚫 [${blockType}] WS Blocked`); return; }
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
            console.log(`🚫 [${blockType}] Fetch Blocked`);
            return new Response('{"status":"ok"}', { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return originalFetch.apply(this, arguments);
    };

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) { this._ghostifyUrl = url; return originalXhrOpen.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function (body) {
        const blockType = shouldBlock(body, this._ghostifyUrl || '');
        if (blockType) { console.log(`🚫 [${blockType}] XHR Blocked`); return; }
        return originalXhrSend.apply(this, arguments);
    };

    const originalBeacon = navigator.sendBeacon;
    navigator.sendBeacon = function (url, data) {
        const blockType = shouldBlock(data, url);
        if (blockType) { console.log(`🚫 [${blockType}] Beacon Blocked`); return true; }
        return originalBeacon.apply(this, arguments);
    };

    console.log('👻 Ghostify v3.3.0 Active - The 100% Merge');

})();
