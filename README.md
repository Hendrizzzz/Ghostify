<div align="center">

# 👻 Ghostify

**Invisible on Instagram & Messenger**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore/detail/ghostify-hide-seen-typin/YOUR_EXTENSION_ID)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-00C853?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Take back control of your online presence. Browse privately without leaving a trace.*

[Features](#features) • [Installation](#installation) • [How It Works](#how-it-works) • [Contributing](#contributing)

</div>

---

## Features

| Privacy Feature | Instagram | Messenger | Notes |
|:----------------|:---------:|:---------:|:------|
| **Hide Typing Indicator** | ✅ | ✅ | **Always On** protection for Messenger (requires refresh to disable) |
| **Hide Read Receipts** | ✅ | ✅ | Read messages without triggering "Seen" status |
| **Hide Story Views** | ✅ | ✅ | Watch stories anonymously |

> **Important for Messenger:** To ensure maximum privacy, the "Block Typing" feature is **always active** on Messenger. When toggling "Hide Seen" on/off, please **refresh the page** to apply changes instantly.

## Installation

### Option 1: Chrome Web Store (Recommended)
[**Install Ghostify from the Chrome Web Store**](https://chrome.google.com/webstore/detail/ghostify-hide-seen-typin/YOUR_EXTENSION_ID)
*(Link pending publication)*

### Option 2: Manual Install (Developer Mode)
1. Clone or download this repository.
2. Navigate to `chrome://extensions/` in your browser.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `dist/` folder from this project.

## How It Works

Ghostify employs a **dual-layer privacy architecture** to bypass modern tracking mechanisms:

### 1. Network Interception (Instagram)
For Instagram, Ghostify intercepts specific GraphQL requests and WebSocket frames responsible for sending "seen" and "typing" events. It identifies these packets using advanced pattern matching and blocks them before they leave your device.

### 2. Source-Code Replacement (Messenger)
Facebook Messenger's new architecture (LightSpeed/MAW) is highly resistant to network blocking. To bypass this, Ghostify injects a patch directly into the **Main World** execution context of the page.
*   **Module Interception**: We hook into the application's module loader (`window.__d`) to locate the `MAWSecureTypingState` module.
*   **Logic Patching**: The typing logic is neutralized at the source level, preventing the "typing" signal from ever being generated.
*   **CSP Bypass**: A background service worker removes specific Content Security Policy (CSP) headers to allow this secure injection.

### Technical Details

| Component | File | Purpose |
|:----------|:-----|:--------|
| **Main Patcher** | `messenger_patch.js` | Hooks into Messenger's module loader to disable typing logic |
| **CSP Service** | `background.js` | Removes CSP headers to allow script injection |
| **Interceptor** | `ghost.js` | Handles network request blocking (Fetch/XHR/WebSocket) |
| **Config Loader** | `content.js` | Syncs user settings and fetches remote pattern updates |
| **UI** | `popup.html` | User interface for toggling features |
| **Config** | `patterns.json` | Remote-updatable blocking rules |

## Project Structure

```
dist/
├── config/
│   └── patterns.json     # Dynamic blocking rules & versioning
├── css/
│   └── popup.css         # UI Styling
├── icons/                # Extension assets
├── js/
│   ├── background.js     # Service Worker (CSP handling)
│   ├── content.js        # Content Script (Settings sync)
│   ├── ghost.js          # Main World Script (Network Interceptor)
│   ├── messenger_patch.js# Messenger Module Patcher
│   └── popup.js          # UI Logic
├── manifest.json         # Extension Manifest V3
└── popup.html            # Extension Popup
```

## Tech Stack

- **Platform:** Chrome Extension (Manifest V3)
- **Core APIs:** `declarativeNetRequest`, `scripting`, `storage`, `webRequest` (via monkeypatch)
- **Techniques:** Module Hooking, Source Replacement, WebSocket Frame Inspection

## Contributing

Found a bug? Have a feature idea? Want to submit code?

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for guidelines.

## Disclaimer

**Ghostify** is an independent open-source project. It is not affiliated with, endorsed by, or sponsored by **Meta Platforms, Inc.**, **Instagram**, or **Facebook**.

- All product names, logos, and brands are property of their respective owners.
- The use of this extension is at your own discretion.
- This tool is for educational and personal privacy purposes.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">

**Built with 👻 by [Hendrizzzz](https://github.com/Hendrizzzz)**

</div>
