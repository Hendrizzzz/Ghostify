import { SETTINGS, isKilled } from '../config.js';

const REQUEST_NATIVE_GRACE_MS = 15000;
const ROOT_NATIVE_GRACE_MS = 30000;
const CHAT_OPEN_NATIVE_GRACE_MS = 4000;
const CHAT_OPEN_UNREAD_UI_GRACE_MS = 15000;

export function startFacebookProtection() {
    if (window.__GHOSTIFY_FACEBOOK_PROTECTION__) return;
    window.__GHOSTIFY_FACEBOOK_PROTECTION__ = true;

    if (isFacebookFeedRootRoute()) {
        activateRootNativeGrace(Date.now() + ROOT_NATIVE_GRACE_MS);
    }

    const markRequestIntent = (event) => {
        if (isFacebookMessageRequestNavigationTarget(event?.target)) {
            const until = Date.now() + REQUEST_NATIVE_GRACE_MS;
            activateRequestNativeGrace(until);
        }
    };
    const markConversationOpenIntent = (event) => {
        if (isFacebookMessageRequestNavigationTarget(event?.target)) return;
        const intent = getFacebookConversationNavigationState(event?.target);
        if (intent.isConversation) {
            activateChatOpenNativeGrace(Date.now() + CHAT_OPEN_NATIVE_GRACE_MS, intent);
        }
    };

    document.addEventListener('pointerdown', markRequestIntent, true);
    document.addEventListener('pointerdown', markConversationOpenIntent, true);
    document.addEventListener('click', markRequestIntent, true);
    document.addEventListener('click', markConversationOpenIntent, true);
    document.addEventListener('keydown', (event) => {
        if (event?.key !== 'Enter' && event?.key !== ' ') return;
        markRequestIntent(event);
        markConversationOpenIntent(event);
    }, true);
}

export function getFacebookSpoofState() {
    if (hasRecentMessageRequestIntent()) return null;
    if (isFacebookMessageRequestSurface()) return null;

    if (SETTINGS.msgSeen && !isKilled('msgSeen')) {
        if (isFacebookRestoredMiniChatLoadingSurface()) return null;
        if (hasRecentChatOpenIntent()) return 'unfocused-passive';
        if (isFacebookFeedMessengerSurface()) return 'unfocused-passive';
        if (isFacebookFeedRootSurface()) return hasRootNativeGrace() ? null : 'unfocused-passive';
        if (!isFacebookMessagingSurface()) return null;
        return 'unfocused';
    }

    return null;
}

function activateRequestNativeGrace(until) {
    window.__GHOSTIFY_MESSAGE_REQUEST_FOCUS_UNTIL__ = until;
    window.__GHOSTIFY_MESSAGE_REQUEST_NATIVE_UNTIL__ = until;
    emitNativeFocusSignals();
}

function activateRootNativeGrace(until) {
    window.__GHOSTIFY_FACEBOOK_ROOT_NATIVE_UNTIL__ = Math.max(
        Number(window.__GHOSTIFY_FACEBOOK_ROOT_NATIVE_UNTIL__ || 0),
        until
    );
    emitNativeFocusSignals();
}

function activateChatOpenNativeGrace(until, intent = {}) {
    const existingPreserveUntil = Number(window.__GHOSTIFY_FACEBOOK_PRESERVE_UNREAD_UI_UNTIL__ || 0);
    const existingThreadKey = String(window.__GHOSTIFY_FACEBOOK_PRESERVE_UNREAD_UI_THREAD_KEY__ || '');
    const nextThreadKey = intent.threadKey || existingThreadKey;
    const sameThread = intent.threadKey
        ? (existingThreadKey ? intent.threadKey === existingThreadKey : !!intent.wasUnread)
        : true;
    const keepExistingUnread =
        existingPreserveUntil > Date.now() &&
        sameThread &&
        window.__GHOSTIFY_FACEBOOK_PRESERVE_UNREAD_UI_WAS_UNREAD__ === true;

    window.__GHOSTIFY_FACEBOOK_CHAT_OPEN_FOCUS_UNTIL__ = Math.max(
        Number(window.__GHOSTIFY_FACEBOOK_CHAT_OPEN_FOCUS_UNTIL__ || 0),
        until
    );
    window.__GHOSTIFY_FACEBOOK_PRESERVE_UNREAD_UI_UNTIL__ = Math.max(
        existingPreserveUntil,
        Date.now() + CHAT_OPEN_UNREAD_UI_GRACE_MS
    );
    window.__GHOSTIFY_FACEBOOK_PRESERVE_UNREAD_UI_WAS_UNREAD__ = keepExistingUnread || !!intent.wasUnread;
    window.__GHOSTIFY_FACEBOOK_PRESERVE_UNREAD_UI_THREAD_KEY__ = nextThreadKey || '';
    emitNativeFocusSignals();
}

function hasRecentMessageRequestIntent() {
    return Math.max(
        Number(window.__GHOSTIFY_MESSAGE_REQUEST_FOCUS_UNTIL__ || 0),
        Number(window.__GHOSTIFY_MESSAGE_REQUEST_NATIVE_UNTIL__ || 0)
    ) > Date.now();
}

function hasRecentChatOpenIntent() {
    return Number(window.__GHOSTIFY_FACEBOOK_CHAT_OPEN_FOCUS_UNTIL__ || 0) > Date.now();
}

function hasRootNativeGrace() {
    return isFacebookFeedRootRoute() &&
        Number(window.__GHOSTIFY_FACEBOOK_ROOT_NATIVE_UNTIL__ || 0) > Date.now();
}

function emitNativeFocusSignals() {
    dispatchEventSafe(window, 'focus');
    dispatchEventSafe(document, 'visibilitychange');
    dispatchEventSafe(document, 'webkitvisibilitychange');
    dispatchEventSafe(document, 'focusin');
}

function dispatchEventSafe(target, type) {
    try {
        if (!target || typeof target.dispatchEvent !== 'function') return;
        const event = typeof Event === 'function'
            ? new Event(type, { bubbles: type === 'focusin', cancelable: false })
            : { type, target };
        target.dispatchEvent(event);
    } catch (e) { }
}

function isFacebookMessageRequestNavigationTarget(target) {
    const element = getClosestRequestElement(target);
    if (!element) return false;

    let current = element;
    for (let depth = 0; current && depth < 5; depth += 1) {
        const href = getElementAttribute(current, 'href').toLowerCase();
        const label = [
            getElementAttribute(current, 'aria-label'),
            getElementAttribute(current, 'title'),
            current.innerText,
            current.textContent,
            href
        ].filter(Boolean).join(' ').toLowerCase();

        if (isFacebookMessageRequestRouteText(`${href} ${label}`)) return true;
        if (isFacebookConversationRouteText(href)) return false;

        current = current.parentElement;
    }

    return false;
}

function isFacebookConversationNavigationTarget(target) {
    return getFacebookConversationNavigationState(target).isConversation;
}

function getFacebookConversationNavigationState(target) {
    const element = getClosestRequestElement(target);
    if (!element) return { isConversation: false };

    const href = getElementAttribute(element, 'href');
    const label = getElementContextText(element).toLowerCase();
    if (!label && !href) return { isConversation: false };

    if (href.includes('/messages/t/') ||
        href.includes('/messages/e2ee/t/') ||
        label.includes('/messages/t/') ||
        label.includes('/messages/e2ee/t/')) {
        return {
            isConversation: true,
            wasUnread: isFacebookUnreadConversationElement(element, label),
            threadKey: extractFacebookThreadKey(`${href} ${label}`)
        };
    }

    if (isFacebookMessagingSurface() && looksLikeFacebookConversationRowLabel(label)) {
        return {
            isConversation: true,
            wasUnread: isFacebookUnreadConversationElement(element, label),
            threadKey: extractFacebookThreadKey(`${href} ${label}`)
        };
    }

    if (!isFacebookFeedRootRoute()) return { isConversation: false };
    if (!hasDomElement('[role="dialog"][aria-label="Messenger"]')) return { isConversation: false };

    const isConversation = looksLikeFacebookConversationRowLabel(label);
    if (!isConversation) return { isConversation: false };

    return {
        isConversation: true,
        wasUnread: isFacebookUnreadConversationElement(element, label),
        threadKey: extractFacebookThreadKey(`${href} ${label}`)
    };
}

function looksLikeFacebookConversationRowLabel(label) {
    return label.includes('unread message:') ||
        label.includes('active now') ||
        /\b(?:now|\d+\s*[mhdw])\b/.test(label);
}

function getClosestRequestElement(target) {
    if (!target || typeof target !== 'object') return null;
    if (typeof target.closest === 'function') {
        return target.closest('a,button,[role="link"],[role="button"],[aria-label]') || target;
    }
    return target;
}

function getElementAttribute(element, name) {
    try {
        return String(element?.getAttribute?.(name) || '');
    } catch (e) {
        return '';
    }
}

function getElementContextText(element) {
    const parts = [];
    let current = element;
    for (let depth = 0; current && depth < 5; depth += 1) {
        parts.push(
            getElementAttribute(current, 'aria-label'),
            getElementAttribute(current, 'title'),
            current.innerText,
            current.textContent,
            getElementAttribute(current, 'href')
        );
        current = current.parentElement;
    }
    return parts.filter(Boolean).join(' ');
}

function getElementAccessibilityText(element) {
    const parts = [];
    let current = element;
    for (let depth = 0; current && depth < 5; depth += 1) {
        parts.push(
            getElementAttribute(current, 'aria-label'),
            getElementAttribute(current, 'title'),
            getElementAttribute(current, 'data-tooltip-content')
        );
        current = current.parentElement;
    }
    return parts.filter(Boolean).join(' ');
}

function isFacebookUnreadConversationElement(element, label) {
    const accessibilityText = getElementAccessibilityText(element).toLowerCase();
    if (/\bunread(?:\s+message)?\b/.test(accessibilityText) || label.includes('unread message:')) {
        return true;
    }
    return hasFacebookUnreadIndicatorElement(element);
}

function hasFacebookUnreadIndicatorElement(element) {
    for (const root of getElementAndParents(element, 4)) {
        if (isFacebookUnreadIndicatorElement(root)) return true;
        if (isFacebookConversationListBoundaryElement(root)) break;

        try {
            if (typeof root.querySelectorAll === 'function') {
                const accessibleMatches = root.querySelectorAll('[aria-label*="Unread"],[title*="Unread"],[data-tooltip-content*="Unread"]');
                if (accessibleMatches && accessibleMatches.length > 0) return true;
            }
        } catch (e) { }

        try {
            if (typeof root.querySelectorAll === 'function') {
                const candidates = root.querySelectorAll('i,span,div');
                for (const candidate of Array.from(candidates || [])) {
                    if (isFacebookUnreadIndicatorElement(candidate)) return true;
                }
            }
        } catch (e) { }
    }
    return false;
}

function isFacebookConversationListBoundaryElement(element) {
    const role = getElementAttribute(element, 'role').toLowerCase();
    const label = getElementAttribute(element, 'aria-label').toLowerCase();
    return role === 'grid' ||
        role === 'list' ||
        role === 'dialog' ||
        label === 'chats' ||
        label === 'messenger';
}

function getElementAndParents(element, maxDepth) {
    const nodes = [];
    let current = element;
    for (let depth = 0; current && depth < maxDepth; depth += 1) {
        nodes.push(current);
        current = current.parentElement;
    }
    return nodes;
}

function isFacebookUnreadIndicatorElement(element) {
    const accessibilityText = [
        getElementAttribute(element, 'aria-label'),
        getElementAttribute(element, 'title'),
        getElementAttribute(element, 'data-tooltip-content')
    ].filter(Boolean).join(' ').toLowerCase();
    if (/\bunread(?:\s+message)?\b/.test(accessibilityText)) return true;

    try {
        if (typeof window.getComputedStyle !== 'function' || typeof element.getBoundingClientRect !== 'function') {
            return false;
        }
        const rect = element.getBoundingClientRect();
        if (!rect || rect.width < 4 || rect.height < 4 || rect.width > 18 || rect.height > 18) return false;

        const style = window.getComputedStyle(element);
        const color = String(style?.backgroundColor || '').toLowerCase();
        const radius = String(style?.borderRadius || '');
        const isRound = radius.includes('%') || parseFloat(radius) >= Math.min(rect.width, rect.height) / 2 - 1;
        if (!isRound) return false;

        return color.includes('rgb(0, 132, 255)') ||
            color.includes('rgb(24, 119, 242)') ||
            color.includes('rgb(8, 102, 255)');
    } catch (e) {
        return false;
    }
}

function extractFacebookThreadKey(text) {
    const match = String(text || '').match(/\/messages\/(?:e2ee\/)?t\/([^/?#\s]+)/i);
    if (!match) return '';
    try {
        return decodeURIComponent(match[1]);
    } catch (e) {
        return match[1];
    }
}

function isFacebookMessagingSurface() {
    const path = String(window.location?.pathname || '').toLowerCase();
    const search = String(window.location?.search || '').toLowerCase();
    const hash = String(window.location?.hash || '').toLowerCase();

    if (path.startsWith('/messages') || path.startsWith('/messenger')) return true;
    if (search.includes('sk=messages') || hash.includes('messages')) return true;
    if (isFacebookFeedMessengerSurface()) return true;

    return false;
}

function isFacebookFeedRootSurface() {
    if (!isFacebookFeedRootRoute()) return false;
    if (isFacebookFeedMessengerSurface()) return false;
    return true;
}

function isFacebookFeedRootRoute() {
    const path = String(window.location?.pathname || '').toLowerCase();
    const search = String(window.location?.search || '').toLowerCase();
    const hash = String(window.location?.hash || '').toLowerCase();

    if (path !== '/' && path !== '/home.php') return false;
    if (search.includes('sk=messages') || hash.includes('messages')) return false;
    return true;
}

function isFacebookFeedMessengerSurface() {
    const hasMessengerPopover =
        hasDomElement('[role="dialog"][aria-label="Messenger"]') &&
        hasDomElement('[role="grid"][aria-label="Chats"]');
    if (hasMessengerPopover) return true;

    const hasMiniChatChrome =
        hasDomElement('[aria-label="Minimize chat"]') ||
        hasDomElement('[aria-label="Close chat"]');
    if (!hasMiniChatChrome) return false;

    return hasDomElement('[role="textbox"][contenteditable="true"]') ||
        hasDomElement('[aria-label^="Write to"]') ||
        hasDomElement('[aria-label^="Messages in conversation"]') ||
        hasDomElement('[aria-label^="Conversation titled"]');
}

function isFacebookRestoredMiniChatLoadingSurface() {
    const log = getDomElement('[aria-label^="Messages in conversation"]');
    if (!log) return false;

    const text = String(log.innerText || log.textContent || '').replace(/\s+/g, ' ').trim();
    return /^Loading(?:\.{3})?$/i.test(text);
}

function hasDomElement(selector) {
    return !!getDomElement(selector);
}

function getDomElement(selector) {
    try {
        return typeof document?.querySelector === 'function' ? document.querySelector(selector) : null;
    } catch (e) {
        return null;
    }
}

function isFacebookMessageRequestSurface() {
    const path = String(window.location?.pathname || '').toLowerCase();
    const search = String(window.location?.search || '').toLowerCase();
    const hash = String(window.location?.hash || '').toLowerCase();
    const route = `${path} ${search} ${hash}`;

    return isFacebookMessageRequestRouteText(route);
}

function isFacebookMessageRequestRouteText(routeText) {
    const route = String(routeText || '').toLowerCase();

    return route.includes('/messages/requests') ||
        route.includes('/messages/message-requests') ||
        route.includes('/messages/message_requests') ||
        route.includes('folder=message_requests') ||
        route.includes('folder=pending_threads') ||
        route.includes('folder=filtered_threads') ||
        route.includes('folder=spam_threads') ||
        route.includes('message requests') ||
        route.includes('message-requests') ||
        route.includes('message_requests') ||
        route.includes('pending_threads') ||
        route.includes('filtered_threads') ||
        route.includes('spam_threads');
}

function isFacebookConversationRouteText(routeText) {
    const route = String(routeText || '').toLowerCase();
    return route.includes('/messages/t/') ||
        route.includes('/messages/e2ee/t/');
}
