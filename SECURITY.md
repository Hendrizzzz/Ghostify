# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| Latest browser-store release | Yes |
| Current `main` branch | Reports accepted; code may be unreleased |
| Older releases and development builds | No |

Users should update to the latest version available through their browser's
official extension store.

## Report a vulnerability privately

Do not disclose a suspected vulnerability in a public issue, discussion, pull
request, screenshot, or recording.

Use [GitHub private vulnerability reporting](https://github.com/Hendrizzzz/Ghostify/security/advisories/new).
If that form is unavailable, contact the maintainer through the address listed
on Ghostify's official Chrome Web Store entry and include only enough detail to
establish a private reporting channel.

Include, when available:

- the affected Ghostify version and browser
- the affected component or file
- reproducible steps or a minimal proof of concept
- the security or privacy impact
- suggested mitigations

Do not send real private messages, credentials, session tokens, account exports,
or unredacted browser captures. Use synthetic data and redact account-specific
identifiers.

## What happens next

The maintainer will validate the report, determine affected versions, and
coordinate a fix, release, and advisory when appropriate. Response and release
timing depends on severity, reproducibility, browser-store review, and whether a
Meta platform change is involved. No fixed response-time guarantee is claimed.

Please allow time for a supported release to reach users before public
disclosure. Credit is optional and will be published only with the reporter's
permission.

## Scope

Security reports may cover the extension runtime, permissions, page-context
bridges, configuration handling, packaging, website, or release workflows.
Ordinary compatibility breakage caused by a Meta web-app change should use the
public bug-report form unless it crosses a security or privacy boundary.

See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) for the documented trust
boundaries, assumptions, mitigations, and residual risks.
