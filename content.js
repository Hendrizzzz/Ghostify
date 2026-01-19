// content.js - Runs in Isolated World
const DEFAULT_SETTINGS = {
    igTyping: true, igSeen: true, igStory: true,
    msgTyping: false, msgSeen: true, msgStory: true
};

// 1. Get settings immediately
chrome.storage.local.get(['ghostifySettings'], (result) => {
    const settings = result.ghostifySettings || DEFAULT_SETTINGS;
    // Send to ghost.js via window message (Safe way)
    window.postMessage({ type: 'GHOSTIFY_INIT', settings: settings }, '*');
});

// 2. Listen for live updates
chrome.storage.onChanged.addListener((changes) => {
    if (changes.ghostifySettings) {
        window.postMessage({ type: 'GHOSTIFY_UPDATE', settings: changes.ghostifySettings.newValue }, '*');
    }
});
