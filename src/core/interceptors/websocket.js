import { isFacebookDotCom, SETTINGS, isKilled } from '../../config.js';
import { shouldBlock } from '../../utils/network.js';

export function hookWebSocket() {
    const OriginalWebSocket = window.WebSocket;
    const originalWSSend = OriginalWebSocket.prototype.send;

    OriginalWebSocket.prototype.send = function (data) {
        if (isFacebookDotCom && SETTINGS.msgSeen && !isKilled('msgSeen')) {
            try {
                const raw = (data instanceof ArrayBuffer || ArrayBuffer.isView(data))
                    ? new TextDecoder().decode(data) : (typeof data === 'string' ? data : '');
                if (raw.includes('last_read_watermark_ts') || raw.includes('last_seen_time_ms') || raw.includes('open_message_thread_key') || raw.includes('read_receipt') || raw.includes('bump_timestamp_ms') || (raw.includes('label') && raw.includes('209') && raw.includes('thread_fbid')) || (raw.includes('label') && raw.includes('145') && raw.includes('reference_thread_key'))) {
                    console.log('🚫👻 [HARD BLOCK] read-receipt WS payload blocked!');
                    return;
                }
            } catch (e) { }
        }
        const blockType = shouldBlock(data);
        if (blockType) {
            console.log('🚫👻 [' + blockType + '] WS Blocked');
            return;
        }
        return originalWSSend.apply(this, arguments);
    };

    window.WebSocket = function (url, protocols) {
        const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);
        const boundSend = ws.send.bind(ws);
        ws.send = function (data) {
            if (isFacebookDotCom && SETTINGS.msgSeen && !isKilled('msgSeen')) {
                try {
                    const raw = (data instanceof ArrayBuffer || ArrayBuffer.isView(data))
                        ? new TextDecoder().decode(data) : (typeof data === 'string' ? data : '');
                    if (raw.includes('last_read_watermark_ts') || raw.includes('last_seen_time_ms') || raw.includes('open_message_thread_key') || raw.includes('read_receipt') || raw.includes('bump_timestamp_ms') || (raw.includes('label') && raw.includes('209') && raw.includes('thread_fbid')) || (raw.includes('label') && raw.includes('145') && raw.includes('reference_thread_key'))) {
                        console.log('🚫👻 [HARD BLOCK] read-receipt WS payload blocked!');
                        return;
                    }
                } catch (e) { }
            }
            const blockType = shouldBlock(data);
            if (blockType) {
                console.log('🚫👻 [' + blockType + '] WS Blocked');
                return;
            }
            return boundSend(data);
        };
        return ws;
    };
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    Object.assign(window.WebSocket, OriginalWebSocket);
}
