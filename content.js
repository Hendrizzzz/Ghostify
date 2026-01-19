
const DEFAULT_SETTINGS = {
    igTyping: true,
    igSeen: true,
    igStory: true,
    msgTyping: false,  // not supported yet
    msgSeen: true,
    msgStory: true
};


chrome.storage.local.get(['ghostifySettings'], (result) => {
    const settings = result.ghostifySettings || DEFAULT_SETTINGS;
    window.postMessage({ type: 'GHOSTIFY_INIT', settings: settings }, window.location.origin);
});


chrome.storage.onChanged.addListener((changes) => {
    if (changes.ghostifySettings) {
        window.postMessage({
            type: 'GHOSTIFY_UPDATE',
            settings: changes.ghostifySettings.newValue
        }, window.location.origin);
    }
});
