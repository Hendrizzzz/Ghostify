import { SETTINGS, isKilled } from '../config.js';

export function getMessengerSpoofState() {
    if (isMessengerMessageRequestSurface()) return null;

    if (SETTINGS.msgSeen && !isKilled('msgSeen')) {
        return 'unfocused';
    }

    return null;
}

function isMessengerMessageRequestSurface() {
    const path = String(window.location?.pathname || '').toLowerCase();
    const search = String(window.location?.search || '').toLowerCase();
    const hash = String(window.location?.hash || '').toLowerCase();
    const route = `${path} ${search} ${hash}`;

    return path.startsWith('/requests') ||
        path.startsWith('/message-requests') ||
        path.startsWith('/message_requests') ||
        route.includes('folder=message_requests') ||
        route.includes('message_requests') ||
        route.includes('message-requests');
}
