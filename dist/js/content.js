const GITHUB_CONFIG_URL = null;

const FALLBACK_CONFIG = {
    version: "0.0.0",
    killSwitch: [],
    patterns: {
        igTyping: ['indicate_activity', 'typing_indicator'],
        igSeen: ['mark_read', 'mark_seen', 'thread_seen', 'DirectMarkAsSeen'],
        igStory: ['StoriesUpdateSeenMutation', 'reelMediaSeen'],
        msgTyping: ['typing_indicator'],
        msgSeen: ['mark_read', 'mark_seen', '"label":"3"'],
        msgStory: ['stories_update_seen', 'StoriesUpdateSeenMutation']
    }
};

const DEFAULT_SETTINGS = {
    igTyping: true,
    igSeen: true,
    igStory: true,
    msgTyping: false,
    msgSeen: true,
    msgStory: true
};



(async function init() {
    let config = await getStoredConfig();

    sendConfigToGhost(config);

    syncUserSettings();

    if (GITHUB_CONFIG_URL) {
        fetchRemoteConfig();
    } else {
        fetchLocalConfig();
    }
})();



function getStoredConfig() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['ghostifyConfig'], (result) => {
            resolve(result.ghostifyConfig || FALLBACK_CONFIG);
        });
    });
}

async function fetchRemoteConfig() {
    try {
        const response = await fetch(GITHUB_CONFIG_URL, {
            cache: 'no-cache'
        });

        if (response.ok) {
            const freshConfig = await response.json();
            chrome.storage.local.set({ ghostifyConfig: freshConfig });
            sendConfigToGhost(freshConfig);
            console.log('👻 Ghostify: Remote config synced (v' + freshConfig.version + ')');
        }
    } catch (e) {
        console.warn('👻 Ghostify: Using cached config (GitHub fetch failed)');
    }
}

async function fetchLocalConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL('config/patterns.json'));

        if (response.ok) {
            const localConfig = await response.json();
            chrome.storage.local.set({ ghostifyConfig: localConfig });
            sendConfigToGhost(localConfig);
            console.log('👻 Ghostify: Local config loaded (v' + localConfig.version + ')');
        }
    } catch (e) {
        console.warn('👻 Ghostify: Using fallback config');
    }
}

function sendConfigToGhost(config) {
    window.postMessage({
        type: 'GHOSTIFY_CONFIG_UPDATE',
        config: config
    }, '*');
}



function syncUserSettings() {
    chrome.storage.local.get(['ghostifySettings'], (result) => {
        const settings = result.ghostifySettings || DEFAULT_SETTINGS;
        window.postMessage({
            type: 'GHOSTIFY_SETTINGS_UPDATE',
            settings: settings
        }, '*');
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.ghostifySettings) {
            window.postMessage({
                type: 'GHOSTIFY_SETTINGS_UPDATE',
                settings: changes.ghostifySettings.newValue
            }, '*');
        }
    });
}
