import { STORE_LINKS } from "./demo-stage-data";

const localUseRows = [
  "chrome.storage.local for preferences",
  "host permissions for supported platforms",
  "bundled signal patterns",
  "content and page scripts inside the browser",
];

const localDoesNotCollectRows = [
  "messages",
  "login credentials",
  "browsing history",
  "social activity",
  "analytics events",
  "personal data for sale or sharing",
];

const mechanismRows = [
  "Popup controls",
  "chrome.storage.local",
  "Content script",
  "Page script",
  "Fetch / XHR / WebSocket hooks",
  "Dynamic rules where applicable",
  "Signal blocked or allowed",
];

const permissionRows = [
  ["storage", "saves your Ghostify toggles locally"],
  ["declarativeNetRequest", "blocks selected supported requests"],
  ["instagram.com", "runs Instagram protections"],
  ["messenger.com", "runs Messenger protections"],
  ["facebook.com", "runs Facebook/Messenger protections"],
] as const;

const faqItems = [
  [
    "Is Ghostify affiliated with Meta?",
    "No. Ghostify is independent and is not affiliated with, endorsed by, or sponsored by Meta, Instagram, Facebook, or Messenger.",
  ],
  [
    "Does Ghostify collect my messages or login?",
    "No. The privacy policy says Ghostify does not collect or transmit personal data, browsing history, activity, or credentials.",
  ],
  [
    "Why does it need site permissions?",
    "It needs supported-site access so the extension can run local scripts that detect selected outgoing presence signals.",
  ],
  [
    "Will it break sending messages?",
    "It is designed to block selected presence signals, not normal message sends. Messenger send stability is part of the current 2.0.1 product truth.",
  ],
  [
    "Will protections always work?",
    "No extension can promise that. Meta surfaces can change, and protections may require updates.",
  ],
  [
    "What should I do after updating?",
    "Refresh already-open Messenger or Facebook tabs so document-start patches load again.",
  ],
  [
    "Can I inspect how it works?",
    "Yes. The source, manifest, popup, bundled patterns, and scripts are available in the GitHub repository.",
  ],
] as const;

export function LocalOnlyLedger() {
  return (
    <section className="section-block proof-section" id="privacy" aria-labelledby="local-ledger-title">
      <div className="section-inner proof-grid">
        <div className="section-heading">
          <h2 id="local-ledger-title">No account. No tracking. No servers.</h2>
          <p>
            Ghostify stores preferences locally in your browser and ships its blocking patterns with the
            extension package. There is no Ghostify account or backend relay.
          </p>
        </div>

        <div className="ledger-pair">
          <ProofLedger title="Ghostify uses" rows={localUseRows} />
          <ProofLedger title="Ghostify does not collect" rows={localDoesNotCollectRows} />
        </div>
      </div>
    </section>
  );
}

function ProofLedger({ title, rows }: { title: string; rows: readonly string[] }) {
  return (
    <article className="proof-ledger">
      <h3>{title}</h3>
      <ul>
        {rows.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
    </article>
  );
}

export function MechanismProof() {
  return (
    <section className="section-block mechanism-section" aria-labelledby="mechanism-title">
      <div className="section-inner">
        <div className="section-heading">
          <h2 id="mechanism-title">Browser-side filters, local settings, bundled signal rules.</h2>
          <p>
            The popup writes your settings locally. Content scripts pass those settings and bundled
            patterns into page-side hooks that identify selected presence signals before they leave.
          </p>
        </div>

        <ol className="mechanism-rail" aria-label="Ghostify browser-side mechanism">
          {mechanismRows.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>

        <p className="mechanism-caveat">
          Messenger and Facebook patches load at document start. After updating the extension, refresh
          already-open tabs.
        </p>
      </div>
    </section>
  );
}

export function InstallProof() {
  return (
    <section className="section-block install-section" id="install" aria-labelledby="install-title">
      <div className="section-inner install-grid">
        <div className="section-heading">
          <h2 id="install-title">Install from the store, then inspect the source if you want the receipts.</h2>
          <p>
            Ghostify needs access to supported social sites so it can run local interception logic there.
            It also uses browser storage for your preferences.
          </p>
        </div>

        <div className="install-actions" aria-label="Install and source links">
          <a href={STORE_LINKS.chrome}>Add to Chrome</a>
          <a href={STORE_LINKS.edge}>Get for Edge</a>
          <a href={STORE_LINKS.github}>View Source on GitHub</a>
        </div>

        <div className="permission-ledger">
          <h3>Permission ledger</h3>
          <dl>
            {permissionRows.map(([permission, reason]) => (
              <div key={permission}>
                <dt>{permission}</dt>
                <dd>{reason}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function FaqCaveats() {
  return (
    <section className="section-block faq-section" id="faq" aria-labelledby="faq-title">
      <div className="section-inner">
        <div className="section-heading">
          <h2 id="faq-title">Caveats should be visible before trust is required.</h2>
        </div>

        <div className="faq-list">
          {faqItems.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Ghostify is an independent open-source browser extension for local social presence controls.</p>
      <nav aria-label="Footer links">
        <a href={STORE_LINKS.github}>GitHub</a>
        <a href={STORE_LINKS.privacy}>Privacy</a>
        <a href={STORE_LINKS.license}>License</a>
        <a href={STORE_LINKS.issues}>Issues</a>
        <a href={STORE_LINKS.chrome}>Chrome</a>
        <a href={STORE_LINKS.edge}>Edge</a>
      </nav>
      <p>
        Not affiliated with, endorsed by, or sponsored by Meta, Instagram, Facebook, or Messenger. Users
        remain subject to the terms and privacy policies of the platforms they use.
      </p>
    </footer>
  );
}
