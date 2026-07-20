# Ghostify Threat Model

This document describes the security and privacy boundaries of Ghostify's
browser-extension runtime. It is a design record, not a claim that the extension
can control or authenticate the Meta pages on which it runs.

## Scope and assets

The model covers the Manifest V3 extension, its Chromium and Firefox packages,
the public status feed, the website, and the repository release process.
Assets that Ghostify must protect include:

- the user's extension settings
- the integrity of packaged code, manifests, and release assets
- the privacy properties of supported Seen, Typing, and Story View controls
- private vulnerability reports and maintainer credentials
- normal message sending, navigation, media playback, and page behavior that
  should continue when a privacy write is blocked

Ghostify does not store social-media credentials and does not treat page content
as secret from the page that already owns and renders that content.

## Trust boundaries

### Extension and browser APIs

The background service worker, popup, isolated content script, extension
storage, and `declarativeNetRequest` API are privileged extension surfaces.
Only `storage` and `declarativeNetRequest` permissions are declared. Host access
is limited to the supported Meta domains, the Messenger proxy host, and the
Ghostify status host.

### Isolated world to main world

The isolated content script reads bundled configuration and extension settings,
then sends a sanitized set of booleans and pattern data to main-world scripts
with `window.postMessage`. The main-world scripts must run beside Meta's own code
to wrap page-native fetch, XHR, WebSocket, worker, focus, and module-loader
surfaces.

This bridge is not an authentication boundary. A script running in the page can
observe or imitate page messages, mutate page-visible globals, race hooks, or
restore page-native APIs. The bridge therefore carries no credentials, tokens,
private messages, or privileged extension operations. Incoming settings,
kill-switch entries, and patterns are restricted to known keys and bounded
values before use. A hostile page can still degrade or disable Ghostify on that
page; Ghostify does not claim tamper resistance against the site it modifies.

### Public status feed

The popup performs a credential-free GET of the public `status.json` feed. The
feed is display-only: it cannot change privacy settings, runtime patterns,
permissions, or blocking behavior. Failure or malformed data must leave the
privacy engine running from packaged code and configuration.

### Build and release

Source changes pass browser-specific tests, package validation, dependency
audits, generated-bundle drift checks, workflow linting, and secret scanning.
Third-party GitHub Actions are pinned to full commit SHAs. Store publication and
GitHub release creation remain maintainer-controlled, and release packages have
SHA-256 checksum assets.

## Attacker capabilities considered

- a compromised or adversarial script executing on a matched Meta page
- malformed network, worker, module-loader, or page-message data
- a malicious or compromised dependency or CI action
- a malicious contribution attempting to broaden permissions or weaken privacy
  matching
- a network or hosting failure affecting the public status feed
- accidental leakage of private account data in bug reports or diagnostics

## Principal mitigations

- minimal manifest permissions and explicit host allowlists
- runtime path and host guards for the broader `www.fbsbx.com` match
- packaged configuration rather than remotely executable code or remote runtime
  rules
- bounded pattern lists and pattern length, with unsupported metacharacters
  rejected
- settings reduced to known boolean keys before the main privacy engine uses
  them
- diagnostics disabled by default, bounded in memory, and designed to store
  redacted metadata rather than raw message bodies or identifiers
- synthetic regression fixtures and package validators for privacy-sensitive
  behavior
- pinned CI actions, Dependabot, high-severity dependency audits, secret
  scanning, push protection, protected `main`, and maintainer-controlled releases
- private vulnerability reporting and instructions not to submit real account
  data

## Residual risks and failure modes

- Meta can change endpoints, payloads, workers, or module internals without
  notice. A control may stop working or may need a narrow compatibility update.
- A matched page can detect, bypass, or interfere with main-world hooks and can
  spoof the non-privileged page bridge.
- Pattern-based interception can create false positives or miss new privacy
  writes. Tests reduce this risk but do not replace live browser verification.
- Blocking a write can affect local UI state even when the remote privacy signal
  is suppressed.
- Browser-store review and rollout delays can leave users on an older version.
- The project has one primary maintainer, creating continuity and response-time
  risk.

## Non-goals

Ghostify does not claim to:

- make a user anonymous to Meta or conceal all activity
- protect against a compromised browser, operating system, extension profile,
  or maintainer account
- guarantee uninterrupted behavior after third-party platform changes
- prevent the page from reading content it already displays
- bypass authentication, access controls, moderation, or account restrictions
- preserve or retrieve ephemeral or view-once media against a sender's intended
  restriction

Security issues should be reported through [SECURITY.md](../SECURITY.md).
