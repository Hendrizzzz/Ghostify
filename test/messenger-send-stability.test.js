const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const ghostSource = fs.readFileSync('dist/js/ghost.js', 'utf8');

class FakeResponse {
    constructor(body, init = {}) {
        this.body = body;
        this.status = init.status || 200;
        this.ghostifyResponse = true;
    }
}

class FakeWebSocket {
    constructor(url) {
        this.url = url;
        this.sent = [];
    }

    send(data) {
        this.sent.push(data);
        return 'sent';
    }
}

class FakeXHR {
    open(method, url) {
        this._ghostifyMethod = method;
        this._ghostifyUrl = url;
    }

    send(body) {
        this.sent = body;
        return 'sent';
    }
}

function FakeEventTarget() { }
FakeEventTarget.prototype.addEventListener = function () { };
FakeEventTarget.prototype.removeEventListener = function () { };

function FakeDocument() { }
Object.defineProperty(FakeDocument.prototype, 'visibilityState', {
    get() { return 'visible'; },
    configurable: true
});
Object.defineProperty(FakeDocument.prototype, 'hidden', {
    get() { return false; },
    configurable: true
});

const messengerSendWithWatermark = JSON.stringify({
    issue_new_task: true,
    tasks: [{
        label: 'send_message',
        queue_name: 'messenger_send_message',
        payload: {
            thread_key: { thread_fbid: 'redacted-thread' },
            send_type: 1,
            message: { text: '<redacted-user-text>' },
            last_read_watermark_ts: 1779530000000
        }
    }]
});

const messengerTyping = JSON.stringify({
    issue_new_task: true,
    tasks: [{
        label: 'sendChatStateFromComposer',
        payload: {
            thread_key: { thread_fbid: 'redacted-thread' },
            chatstate: 'typing_indicator',
            send_type: 'typing'
        }
    }]
});

const messengerReadReceipt = JSON.stringify({
    issue_new_task: true,
    tasks: [{
        label: 'read_receipt',
        payload: {
            thread_key: { thread_fbid: 'redacted-thread' },
            sendReadReceipt: true
        }
    }]
});

function makeMessengerPage(settings = {}) {
    const listeners = {};
    const document = new FakeDocument();
    document.readyState = 'complete';
    document.hasFocus = () => true;
    document.addEventListener = function () { };

    const window = {
        location: {
            hostname: 'www.messenger.com',
            pathname: '/t/123',
            href: 'https://www.messenger.com/t/123'
        },
        document,
        addEventListener(type, listener) {
            listeners[type] = listeners[type] || [];
            listeners[type].push(listener);
        },
        postMessage(message) {
            for (const listener of listeners.message || []) {
                listener({ source: window, data: message });
            }
        },
        fetch: async () => ({ original: true }),
        WebSocket: FakeWebSocket,
        XMLHttpRequest: FakeXHR,
        EventTarget: FakeEventTarget,
        navigator: { sendBeacon: () => 'beacon' },
        localStorage: { ghostifyDebug: '0', ghostifyMessengerObserve: '0' },
        Response: FakeResponse,
        TextDecoder,
        ArrayBuffer,
        URLSearchParams,
        FormData: class { }
    };
    window.window = window;

    const context = {
        window,
        document,
        Document: FakeDocument,
        navigator: window.navigator,
        location: window.location,
        Response: FakeResponse,
        WebSocket: FakeWebSocket,
        XMLHttpRequest: FakeXHR,
        EventTarget: FakeEventTarget,
        TextDecoder,
        ArrayBuffer,
        URLSearchParams,
        FormData: window.FormData,
        localStorage: window.localStorage,
        console: {
            debug() { },
            log() { },
            error() { }
        }
    };
    context.globalThis = context;

    vm.runInNewContext(ghostSource, context, { filename: 'ghost.js' });
    window.postMessage({
        type: 'GHOSTIFY_SETTINGS_UPDATE',
        source: 'GHOSTIFY_EXTENSION',
        settings: {
            igTyping: true,
            igSeen: true,
            igStory: true,
            msgTyping: true,
            msgSeen: true,
            msgStory: true,
            ...settings
        }
    });

    return window;
}

async function fetchOutcome(window, body) {
    const response = await window.fetch('/ls_req', {
        method: 'POST',
        body
    });
    return response.ghostifyResponse ? JSON.parse(response.body).blocked : 'allowed';
}

function websocketOutcome(window, body) {
    const socket = new window.WebSocket('wss://edge-chat.messenger.com/chat?region=redacted');
    return socket.send(body) === 'sent' ? 'allowed' : 'blocked';
}

async function testMessengerSendWatermarkTrafficIsAllowed() {
    const window = makeMessengerPage();

    assert.strictEqual(
        await fetchOutcome(window, messengerSendWithWatermark),
        'allowed',
        'Messenger send-like LS traffic with send_type must not be treated as a read receipt'
    );
    assert.strictEqual(
        websocketOutcome(window, messengerSendWithWatermark),
        'allowed',
        'Messenger send-like WebSocket traffic with send_type must not be dropped'
    );
}

async function testMessengerTypingAndSeenProtectionsStillBlock() {
    const window = makeMessengerPage();

    assert.strictEqual(await fetchOutcome(window, messengerTyping), 'MSG_TYPING');
    assert.strictEqual(websocketOutcome(window, messengerTyping), 'blocked');
    assert.strictEqual(await fetchOutcome(window, messengerReadReceipt), 'MSG_SEEN');
    assert.strictEqual(websocketOutcome(window, messengerReadReceipt), 'blocked');
}

async function testMessengerTogglesDisableProtections() {
    const window = makeMessengerPage({
        msgSeen: false,
        msgTyping: false
    });

    assert.strictEqual(await fetchOutcome(window, messengerSendWithWatermark), 'allowed');
    assert.strictEqual(await fetchOutcome(window, messengerTyping), 'allowed');
    assert.strictEqual(await fetchOutcome(window, messengerReadReceipt), 'allowed');
}

(async () => {
    await testMessengerSendWatermarkTrafficIsAllowed();
    await testMessengerTypingAndSeenProtectionsStillBlock();
    await testMessengerTogglesDisableProtections();
    console.log('messenger send-stability regression tests passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
