<div align="center">

# 👻 Ghostify

**Privacy Control for Instagram & Messenger**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-00C853?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Take back control of your online presence. Browse privately without leaving a trace.*

[Installation](#installation) • [Features](#features) • [How It Works](#how-it-works) • [Contributing](#contributing)

</div>

---

## Features

| Privacy Feature | Instagram | Messenger |
|:----------------|:---------:|:---------:|
| Hide Typing Indicator | ✅ | ❌ |
| Hide Read Receipts | ✅ | ✅ |
| Hide Story Views | ✅ | ✅ |

## Installation

### Option 1: Chrome Web Store
*Coming soon*

### Option 2: Manual Install
1. Clone or download this repository
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → Select the `dist/` folder

## How It Works

Ghostify operates using a **dual-layer privacy shield**:

```
┌─────────────────────────────────────────────────────────┐
│                    Your Browser                         │
│  ┌───────────────┐         ┌──────────────────────┐     │
│  │  Visibility   │         │  Network Interceptor │     │
│  │    Spoofer    │         │  (WebSocket/Fetch)   │     │
│  │               │         │                      │     │
│  │ Reports page  │         │  Blocks "seen" and   │     │
│  │ as "hidden"   │         │  "typing" requests   │     │
│  └───────────────┘         └──────────────────────┘     │
│           │                          │                  │
│           └────────────┬─────────────┘                  │
│                        ▼                                │
│                 Privacy Protected                       │
└─────────────────────────────────────────────────────────┘
```

### Technical Details

| Component | File | Purpose |
|:----------|:-----|:--------|
| Content Script | `content.js` | Loads config, syncs settings |
| Main World Script | `ghost.js` | Intercepts network requests |
| Popup UI | `popup.html` | User-facing toggle controls |
| Config | `patterns.json` | Blocking pattern definitions |

## Project Structure

```
dist/
├── config/
│   └── patterns.json     # Blocking patterns
├── css/
│   └── popup.css         # Popup styles
├── icons/                # Extension icons
├── js/
│   ├── content.js        # Config loader
│   ├── ghost.js          # Core interceptor
│   └── popup.js          # Popup logic
├── manifest.json
└── popup.html
```

## Tech Stack

- **Platform:** Chrome Extension (Manifest V3)
- **APIs:** Chrome Storage, WebSocket, Fetch, XMLHttpRequest
- **Techniques:** Prototype patching, Visibility API spoofing, Request interception

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
