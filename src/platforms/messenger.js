// src/platforms/messenger.js
import { isMessengerDotCom, SETTINGS, isKilled } from '../config.js';

export function getMessengerSpoofState() {
    // messenger.com: Full visibility spoofing always. No exceptions needed for videos.
    if (isMessengerDotCom && SETTINGS.msgSeen && !isKilled('msgSeen')) {
        return 'unfocused';
    }
    return null;
}
