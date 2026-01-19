/**
 * @fileoverview Ghostify Popup Script
 * @description Handles the extension popup UI and settings persistence.
 * @version 2.0.0
 */

/**
 * Default settings applied on first install.
 * @constant {Object}
 */
const DEFAULT_SETTINGS = {
    igTyping: true,
    igSeen: true,
    igStory: true,
    msgTyping: false,
    msgSeen: true,
    msgStory: true
};

/**
 * Element ID to settings key mapping.
 * @constant {Object}
 */
const ELEMENT_MAP = {
    'ig-typing': 'igTyping',
    'ig-seen': 'igSeen',
    'ig-story': 'igStory',
    'msg-seen': 'msgSeen',
    'msg-story': 'msgStory'
};

/**
 * Initialize popup when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    attachEventListeners();
});

/**
 * Load saved settings from Chrome storage and update UI.
 */
function loadSettings() {
    chrome.storage.local.get(['ghostifySettings'], (result) => {
        const settings = result.ghostifySettings || DEFAULT_SETTINGS;

        Object.entries(ELEMENT_MAP).forEach(([elementId, settingKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.checked = settings[settingKey];
            }
        });
    });
}

/**
 * Attach change listeners to all toggle inputs.
 */
function attachEventListeners() {
    const inputs = document.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(input => {
        input.addEventListener('change', saveSettings);
    });
}

/**
 * Save current UI state to Chrome storage.
 */
function saveSettings() {
    const settings = {
        igTyping: document.getElementById('ig-typing')?.checked ?? true,
        igSeen: document.getElementById('ig-seen')?.checked ?? true,
        igStory: document.getElementById('ig-story')?.checked ?? true,
        msgTyping: false, // Always false (not supported)
        msgSeen: document.getElementById('msg-seen')?.checked ?? true,
        msgStory: document.getElementById('msg-story')?.checked ?? true
    };

    chrome.storage.local.set({ ghostifySettings: settings });
}
