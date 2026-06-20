import { motion } from 'motion/react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { STATUS_DATA } from '../statusData';

type PlatformName = 'Instagram' | 'Messenger' | 'Facebook';

function PlatformLogoMark({ platform }: { platform: PlatformName }) {
  if (platform === 'Instagram') {
    return (
      <svg className="platform-logo-mark" width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#instagramShowcaseGradient)" />
        <rect x="9.4" y="9.4" width="13.2" height="13.2" rx="4" stroke="white" strokeWidth="2.2" />
        <circle cx="16" cy="16" r="3.8" stroke="white" strokeWidth="2.2" />
        <circle cx="21.2" cy="10.9" r="1.45" fill="white" />
        <defs>
          <linearGradient id="instagramShowcaseGradient" x1="6" y1="27" x2="27" y2="5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEDA75" />
            <stop offset="0.32" stopColor="#FA7E1E" />
            <stop offset="0.62" stopColor="#D62976" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (platform === 'Messenger') {
    return (
      <svg className="platform-logo-mark" width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 4C9.1 4 4 8.75 4 15.15c0 3.45 1.48 6.45 3.95 8.45v4.1c0 .72.77 1.18 1.39.82l3.55-2.05c1 .25 2.05.38 3.11.38 6.9 0 12-4.75 12-11.7S22.9 4 16 4Z"
          fill="url(#messengerShowcaseGradient)"
        />
        <path d="M9.2 18.8 14 13.7l3.42 3.52 5.38-5.52-4.8 7.88-3.52-3.52-5.28 2.74Z" fill="white" />
        <defs>
          <linearGradient id="messengerShowcaseGradient" x1="5" y1="27" x2="27" y2="5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078FF" />
            <stop offset="0.55" stopColor="#00C6FF" />
            <stop offset="1" stopColor="#A033FF" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg className="platform-logo-mark" width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="24" height="24" rx="7" fill="#1877F2" />
      <path
        d="M18.25 27.2v-9.55h3.2l.48-3.72h-3.68v-2.38c0-1.08.3-1.82 1.85-1.82h1.98V6.4c-.34-.05-1.52-.15-2.88-.15-2.85 0-4.8 1.74-4.8 4.94v2.74h-3.23v3.72h3.23v9.55h3.85Z"
        fill="white"
      />
    </svg>
  );
}

const SHOWCASES: Array<{
  platform: PlatformName;
  capability: string;
  src: string;
  proof: string;
  detail: string;
}> = [
  {
    platform: 'Messenger',
    capability: 'Hide Seen',
    src: '/messenger-hide-seen.gif',
    proof: 'Read without sending the visible Seen receipt.',
    detail: 'Messenger web privacy control',
  },
  {
    platform: 'Facebook',
    capability: 'Hide Story Views',
    src: '/facebook-hide-story.gif',
    proof: 'Watch supported stories without adding a viewer signal.',
    detail: 'Facebook story surface',
  },
  {
    platform: 'Instagram',
    capability: 'Hide Story Views',
    src: '/instagram-hide-story.gif',
    proof: 'Story-view blocking stays scoped to supported Instagram tabs.',
    detail: 'Instagram story surface',
  },
];

export function PlatformSection() {
  return (
    <section
      id="platforms"
      className="snap-start"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(64px, 8vw, 104px) 0',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(240,230,210,0.06) 20%, rgba(240,230,210,0.06) 80%, transparent)' }} />

      <div className="platform-inner" style={{ padding: '0 clamp(24px, 4vw, 56px)', maxWidth: 1380, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div className="platform-headline">
          <div>
            <h2 style={{ fontFamily: 'var(--g-sans)', fontSize: 'clamp(1.65rem, 2.6vw, 2.25rem)', fontWeight: 500, color: 'var(--g-white)', margin: 0, lineHeight: 1.16, letterSpacing: 0 }}>
              One layer. Three surfaces.
            </h2>
            <p style={{ fontFamily: 'var(--g-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--g-body)', margin: '16px 0 0', maxWidth: 500 }}>
              Ghostify runs as a local browser extension across Messenger, Facebook, and Instagram, with controls scoped to supported tabs.
            </p>
          </div>

          <a className="status-summary" href="/status" aria-label="Open Ghostify public verification status">
            <div className="status-summary-top">
              <ShieldCheck size={15} strokeWidth={1.6} />
              <span>Public Verification Status</span>
              <ArrowUpRight size={13} strokeWidth={1.7} />
            </div>
            <div className="status-summary-copy">
              v{STATUS_DATA.productVersion} checks are {STATUS_DATA.summary.label.toLowerCase()}.
            </div>
          </a>
        </div>

        <div className="platform-showcase-grid">
          {SHOWCASES.map((item, index) => (
            <motion.article
              className="surface-card"
              key={item.platform}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.48, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="surface-media">
                <img src={item.src} alt={`${item.platform} ${item.capability} demo`} loading="lazy" />
              </div>

              <div className="surface-copy">
                <div className="surface-title-row">
                  <PlatformLogoMark platform={item.platform} />
                  <div>
                    <h3>{item.platform}</h3>
                    <p>{item.detail}</p>
                  </div>
                </div>
                <div className="surface-capability">{item.capability}</div>
                <p className="surface-proof">{item.proof}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="platform-notes">
          <p>
            Controls are applied locally per browser tab. Story view coverage varies by platform version.
          </p>
          <p>
            Ghostify is not affiliated with Meta, Facebook, Messenger, or Instagram. Platform names and marks are used as factual compatibility descriptors only.
          </p>
        </div>
      </div>

      <style>{`
        .platform-headline {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(300px, 390px);
          gap: clamp(24px, 4vw, 56px);
          align-items: end;
          margin-bottom: clamp(34px, 5vw, 60px);
        }

        .status-summary {
          display: block;
          padding: 17px 18px;
          border: 1px solid rgba(240,230,210,0.09);
          border-radius: 10px;
          background: rgba(240,230,210,0.025);
          color: inherit;
          text-decoration: none;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }

        .status-summary:hover {
          border-color: rgba(240,230,210,0.18);
          background: rgba(240,230,210,0.04);
          transform: translateY(-1px);
        }

        .status-summary-top {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--g-mono);
          font-size: 10.5px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: rgba(240,230,210,0.42);
          margin-bottom: 9px;
        }

        .status-summary-top svg:first-child {
          color: rgba(91,173,106,0.78);
        }

        .status-summary-top svg:last-child {
          margin-left: auto;
          color: rgba(240,230,210,0.3);
        }

        .status-summary-copy {
          font-family: var(--g-sans);
          font-size: 14px;
          line-height: 1.45;
          color: var(--g-body);
        }

        .platform-showcase-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(16px, 2.2vw, 26px);
          align-items: stretch;
        }

        .surface-card {
          min-width: 0;
          overflow: hidden;
          border-radius: 12px;
          background: rgba(240,230,210,0.025);
          border: 1px solid rgba(240,230,210,0.075);
          box-shadow: 0 22px 64px rgba(0,0,0,0.26);
        }

        .surface-media {
          position: relative;
          aspect-ratio: 16 / 10.6;
          background: #090807;
          border-bottom: 1px solid rgba(240,230,210,0.07);
          overflow: hidden;
        }

        .surface-media::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.035);
        }

        .surface-media img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center top;
        }

        .surface-copy {
          padding: clamp(16px, 2vw, 22px);
        }

        .surface-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .platform-logo-mark {
          flex: 0 0 auto;
          border-radius: 8px;
          filter: saturate(0.98) brightness(0.96);
        }

        .surface-title-row h3 {
          font-family: var(--g-sans);
          font-size: 16px;
          line-height: 1.15;
          font-weight: 500;
          color: var(--g-white);
          margin: 0;
          letter-spacing: 0;
        }

        .surface-title-row p {
          font-family: var(--g-mono);
          font-size: 10px;
          line-height: 1.3;
          color: rgba(240,230,210,0.28);
          margin: 3px 0 0;
          letter-spacing: 0.03em;
        }

        .surface-capability {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 6px;
          background: rgba(196,72,48,0.08);
          border: 1px solid rgba(196,72,48,0.18);
          font-family: var(--g-mono);
          font-size: 10px;
          color: rgba(196,72,48,0.82);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 13px;
        }

        .surface-proof {
          font-family: var(--g-sans);
          font-size: 15px;
          line-height: 1.58;
          color: var(--g-body);
          margin: 0;
        }

        .platform-notes {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
          gap: clamp(18px, 4vw, 48px);
          border-top: 1px solid rgba(240,230,210,0.06);
          margin-top: clamp(28px, 4vw, 46px);
          padding-top: 18px;
        }

        .platform-notes p {
          font-family: var(--g-mono);
          font-size: 10.5px;
          line-height: 1.75;
          color: rgba(240,230,210,0.24);
          letter-spacing: 0.02em;
          margin: 0;
        }

        .platform-notes p:last-child {
          color: rgba(240,230,210,0.18);
        }

        @media (max-width: 980px) {
          .platform-headline {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .status-summary {
            max-width: 430px;
          }

          .platform-showcase-grid {
            grid-template-columns: 1fr;
          }

          .surface-card {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
          }

          .surface-media {
            aspect-ratio: auto;
            min-height: 260px;
            border-bottom: 0;
            border-right: 1px solid rgba(240,230,210,0.07);
          }

          .surface-copy {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .platform-inner {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }

          .surface-card {
            display: block;
            border-radius: 10px;
          }

          .surface-media {
            aspect-ratio: 16 / 11.5;
            min-height: 0;
            border-right: 0;
            border-bottom: 1px solid rgba(240,230,210,0.07);
          }

          .platform-notes {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}
