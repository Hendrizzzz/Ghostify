const DEFAULT_SETTINGS = {
    igTyping: true, igSeen: true, igStory: true,
    msgTyping: false, msgSeen: true, msgStory: true
};

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['ghostifySettings'], (result) => {
        const settings = result.ghostifySettings || DEFAULT_SETTINGS;
        document.getElementById('ig-typing').checked = settings.igTyping;
        document.getElementById('ig-seen').checked = settings.igSeen;
        document.getElementById('ig-story').checked = settings.igStory;
        document.getElementById('msg-seen').checked = settings.msgSeen;
        document.getElementById('msg-story').checked = settings.msgStory;
    });

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('change', saveSettings));
});

function saveSettings() {
    const settings = {
        igTyping: document.getElementById('ig-typing').checked,
        igSeen: document.getElementById('ig-seen').checked,
        igStory: document.getElementById('ig-story').checked,
        msgTyping: false,
        msgSeen: document.getElementById('msg-seen').checked,
        msgStory: document.getElementById('msg-story').checked
    };
    chrome.storage.local.set({ ghostifySettings: settings });
}
