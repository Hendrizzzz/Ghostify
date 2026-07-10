import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Code2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import {
  STATUS_DATA,
  STATUS_LABELS,
  formatStatusDate,
  getPublicReleaseStatus,
} from '../statusData';
import { GhostMark } from './GhostSVG';
import { PlatformLogo, type MetaPlatform } from './PlatformLogo';
import { EDGE_STORE_URL, GITHUB_URL, StoreCta } from './SiteChrome';

const FEATURES: Array<{
  platform: MetaPlatform;
  name: string;
  title: string;
  body: string;
  src: string;
  width: number;
  height: number;
}> = [
  {
    platform: 'messenger',
    name: 'Messenger',
    title: 'Read it. Leave the reply for later.',
    body: 'Open supported conversations without turning the moment you read into a demand to answer. Ghostify holds the supported Seen signal while Messenger keeps working normally.',
    src: '/messenger-hide-seen.gif',
    width: 864,
    height: 782,
  },
  {
    platform: 'instagram',
    name: 'Instagram',
    title: 'Watch the story. Stay off the list where supported.',
    body: 'Ghostify keeps the story experience intact while holding the supported viewer signal locally. You choose the control; the rest of Instagram stays familiar.',
    src: '/instagram-hide-story.gif',
    width: 859,
    height: 782,
  },
  {
    platform: 'facebook',
    name: 'Facebook',
    title: 'Bring the same quiet control to Facebook.',
    body: 'Supported story-view, typing, and Seen controls share one setting group with Messenger, so the privacy choice follows the way Meta’s web messaging works.',
    src: '/facebook-hide-story.gif',
    width: 844,
    height: 782,
  },
];

const FACTS = [
  'Open source. Read it yourself.',
  'Instagram, Messenger, Facebook.',
  'No Ghostify account required.',
  'Supported tabs only.',
  'Seen, typing, story views.',
  'Preferences stay in your browser.',
];

const PLATFORMS: Array<{
  platform: MetaPlatform;
  name: string;
  url: string;
  qualifier: string;
}> = [
  { platform: 'instagram', name: 'Instagram', url: 'instagram.com', qualifier: 'Its own control group' },
  { platform: 'messenger', name: 'Messenger', url: 'messenger.com', qualifier: 'Shared settings with Facebook' },
  { platform: 'facebook', name: 'Facebook', url: 'facebook.com', qualifier: 'Shared settings with Messenger' },
];

const AI_PROMPT = [
  'Give me an independent assessment of Ghostify, a browser extension for supported Seen, Typing, and Story View controls on Instagram, Messenger, and Facebook.',
  'Review its public website at https://ghostify-extension.vercel.app and source at https://github.com/Hendrizzzz/Ghostify.',
  'Explain what it does, its privacy model, important limitations, and whether its public claims are supported by the available evidence.',
].join(' ');

const AI_LINKS = [
  { name: 'ChatGPT', href: `https://chatgpt.com/?q=${encodeURIComponent(AI_PROMPT)}` },
  { name: 'Claude', href: `https://claude.ai/new?q=${encodeURIComponent(AI_PROMPT)}` },
  { name: 'Perplexity', href: `https://www.perplexity.ai/search/new?q=${encodeURIComponent(AI_PROMPT)}` },
];

const FAQS = [
  {
    q: 'Does Ghostify read my messages?',
    a: 'Ghostify transiently inspects supported request URLs, payloads, and page or worker messages locally to identify privacy signals. It does not send conversations to Ghostify, store raw messages, or ask for social media passwords.',
  },
  {
    q: 'Does it work in the mobile apps?',
    a: 'No. Ghostify is a browser extension for the web versions of Instagram, Facebook, and Messenger. It cannot affect the native iOS or Android apps.',
  },
  {
    q: 'Can I choose different controls for each platform?',
    a: 'Yes. Instagram has its own controls. Messenger and Facebook share a second group, and each supported signal can be switched independently.',
  },
  {
    q: 'Can a platform update break a control?',
    a: 'Yes. Meta changes its web apps frequently. Ghostify publishes dated verification instead of promising permanent coverage and investigates credible reports when a control needs review.',
  },
  {
    q: 'What should I do after installing or updating?',
    a: 'Reload any open instagram.com, messenger.com, or facebook.com tabs so the current extension code starts before the page loads.',
  },
];

function HeroSignalFlow() {
  return (
    <div className="hero-signal-flow" aria-hidden="true">
      <svg className="signal-paths" viewBox="0 0 1000 440" preserveAspectRatio="none">
        <path d="M125 12C125 138 500 112 500 214" />
        <path d="M500 12V214" />
        <path d="M875 12C875 138 500 112 500 214" />
        <path d="M500 226C500 328 125 302 125 428" />
        <path d="M500 226V428" />
        <path d="M500 226C500 328 875 302 875 428" />
      </svg>

      <span className="signal-packet signal-packet-in signal-column-left">seen</span>
      <span className="signal-packet signal-packet-in signal-column-center">typing</span>
      <span className="signal-packet signal-packet-in signal-column-right">story-view</span>

      <div className="signal-processor">
        <span><GhostMark size={78} /></span>
      </div>

      <span className="signal-packet signal-packet-out signal-column-left">seen-receipt blocked</span>
      <span className="signal-packet signal-packet-out signal-column-center">typing blocked</span>
      <span className="signal-packet signal-packet-out signal-column-right">story-view blocked</span>
    </div>
  );
}

function PrivacyIllustration() {
  return (
    <div className="privacy-illustration" aria-hidden="true">
      <div className="privacy-browser">
        <div className="privacy-browser-bar"><i /><i /><i /></div>
        <div className="privacy-browser-body">
          <span /><span /><span />
          <GhostMark size={72} />
        </div>
      </div>
      <span className="privacy-visual-chip privacy-visual-chip-local">stays local</span>
      <span className="privacy-visual-chip privacy-visual-chip-account">no account</span>
    </div>
  );
}

function FactMarquee() {
  return (
    <section className="fact-marquee" aria-label="Ghostify facts">
      <div className="fact-marquee-track">
        {[0, 1].map((copy) => (
          <div className="fact-marquee-group" aria-hidden={copy === 1 ? 'true' : undefined} key={copy}>
            {FACTS.map((fact) => (
              <span key={fact}><i aria-hidden="true" />{fact}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = FEATURES[activeIndex];

  useEffect(() => {
    const preload = () => {
      FEATURES.forEach((feature) => {
        const image = new Image();
        image.src = feature.src;
      });
    };
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(preload, { timeout: 1800 });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(preload, 500);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const nextIndex = Math.min(FEATURES.length - 1, Math.round(progress * (FEATURES.length - 1)));
      section.style.setProperty('--feature-progress', progress.toFixed(3));
      setActiveIndex((current) => current === nextIndex ? current : nextIndex);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const moveToFeature = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const distance = Math.max(0, section.offsetHeight - window.innerHeight);
    const progress = FEATURES.length === 1 ? 0 : index / (FEATURES.length - 1);
    window.scrollTo({ top: sectionTop + distance * progress, behavior: 'smooth' });
  };

  return (
    <section className="feature-scroll" id="features" ref={sectionRef}>
      <div className="feature-scroll-sticky">
        <div className="feature-scroll-copy" key={`copy-${activeFeature.platform}`}>
          <div className="feature-platform-name">
            <PlatformLogo platform={activeFeature.platform} size={38} />
            <span>{activeFeature.name}</span>
          </div>
          <h2>{activeFeature.title}</h2>
          <p>{activeFeature.body}</p>
          <a href="/status">See current verification <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>

        <figure className="feature-scroll-media" key={`media-${activeFeature.platform}`}>
          <img
            src={activeFeature.src}
            alt={`${activeFeature.name} running with Ghostify in the browser`}
            width={activeFeature.width}
            height={activeFeature.height}
            decoding="async"
          />
        </figure>

        <div className="feature-scroll-nav" role="group" aria-label="Jump to a platform recording">
          {FEATURES.map((feature, index) => (
            <button
              type="button"
              className={index === activeIndex ? 'is-active' : undefined}
              aria-pressed={index === activeIndex}
              onClick={() => moveToFeature(index)}
              key={feature.platform}
            >
              <PlatformLogo platform={feature.platform} size={22} />
              {feature.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mobile-feature-list">
        {FEATURES.map((feature) => (
          <article key={feature.platform} data-platform={feature.platform}>
            <div className="feature-platform-name">
              <PlatformLogo platform={feature.platform} size={34} />
              <span>{feature.name}</span>
            </div>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
            <img
              src={feature.src}
              alt={`${feature.name} running with Ghostify in the browser`}
              width={feature.width}
              height={feature.height}
              loading="lazy"
              decoding="async"
            />
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const releaseStatus = getPublicReleaseStatus();
  const lastVerified = formatStatusDate(STATUS_DATA.provenWorking.lastVerifiedAt);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <h1>Read when you want.<br />Reply when you’re <em>ready.</em></h1>
            <p>Ghostify gives you control over supported Seen, Typing, and Story View signals on Instagram, Messenger, and Facebook — directly in your browser.</p>
            <div className="home-hero-actions">
              <StoreCta />
              <a href="#features">See it in action <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <p className="home-hero-fineprint">Free privacy controls. No Ghostify account or social password.</p>
          </div>

          <div className="home-hero-art">
            <HeroSignalFlow />
          </div>
        </div>
      </section>

      <FactMarquee />
      <FeatureScroll />

      <section className="platforms-flat" id="platforms">
        <header>
          <h2>Six switches.<br />Three familiar places.</h2>
          <p>Instagram gets its own control set. Messenger and Facebook share another, while every supported signal stays independently switchable.</p>
        </header>
        <div className="platform-card-grid">
          {PLATFORMS.map((item) => (
            <article className={`platform-card platform-card-${item.platform}`} key={item.platform}>
              <header>
                <PlatformLogo platform={item.platform} size={54} />
                <span><strong>{item.name}</strong><small>{item.url}</small></span>
              </header>
              <div className="platform-card-controls">
                {['Hide Seen', 'Hide Typing', 'Hide Story Views'].map((control) => (
                  <div key={control}><span>{control}</span><i aria-hidden="true"><b /></i></div>
                ))}
              </div>
              <footer><Check size={16} aria-hidden="true" />{item.qualifier}</footer>
            </article>
          ))}
        </div>
        <a className="platforms-status" href="/status">Coverage changes with the platforms. See verification dated {lastVerified}. <ArrowUpRight size={16} aria-hidden="true" /></a>
      </section>

      <section className="privacy-flat" id="privacy">
        <div className="privacy-flat-lead">
          <h2>Local by default.<br />Open to inspection.</h2>
          <div className="privacy-flat-aside">
            <PrivacyIllustration />
            <p>Ghostify checks supported signal traffic inside the browser tab. Conversations are not sent to Ghostify, and the free controls need no Ghostify account.</p>
          </div>
        </div>
        <div className="privacy-flat-points">
          <article>
            <ShieldCheck size={26} aria-hidden="true" />
            <div><h3>You choose each signal.</h3><p>Seen, typing, and story-view controls stay separate.</p></div>
          </article>
          <article>
            <LockKeyhole size={26} aria-hidden="true" />
            <div><h3>Normal browsing stays intact.</h3><p>Messages, navigation, and media continue while supported privacy signals are targeted.</p></div>
          </article>
          <article>
            <Code2 size={26} aria-hidden="true" />
            <div><h3>The evidence is public.</h3><p>Read the source and check dated verification whenever Meta changes its web apps.</p></div>
          </article>
        </div>
        <div className="privacy-flat-links">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"><Code2 size={22} aria-hidden="true" /><span><strong>Read the source</strong>Ghostify Core is MIT licensed.</span><ArrowUpRight size={17} aria-hidden="true" /></a>
          <a href={`${GITHUB_URL}/blob/main/PRIVACY.md`} target="_blank" rel="noopener noreferrer"><LockKeyhole size={22} aria-hidden="true" /><span><strong>Review every permission</strong>See what runs locally and why.</span><ArrowUpRight size={17} aria-hidden="true" /></a>
          <a href="/status"><ShieldCheck size={22} aria-hidden="true" /><span><strong>Check public status</strong>{STATUS_LABELS[releaseStatus]}.</span><ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
      </section>

      <section className="faq-flat">
        <header>
          <h2>Before you install.</h2>
          <p>Plain answers, without the disappearing fine print.</p>
        </header>
        <div className="faq-flat-list">
          {FAQS.map((item) => (
            <details key={item.q}>
              <summary>{item.q}<span aria-hidden="true">+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ai-opinion">
        <div>
          <h2>Let your favorite AI take an independent look.</h2>
          <p>Open a ready-made prompt asking it to review Ghostify’s public website, source, privacy model, and current limitations.</p>
          <div className="ai-opinion-actions">
            {AI_LINKS.map((item) => (
              <a href={item.href} target="_blank" rel="noopener noreferrer" key={item.name}>
                Ask {item.name}<ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
          <span className="ai-opinion-ghost" aria-hidden="true"><GhostMark size={180} /></span>
        </div>
      </section>

      <section className="home-final">
        <div>
          <div className="home-final-badges">
            <span><span className="chrome-logo" aria-hidden="true"><span /></span>Chrome</span>
            <span>Edge</span>
            <span>Free</span>
          </div>
          <h2>Ghostify, wherever you browse.</h2>
          <p>Quiet privacy controls for supported Meta web apps, ready in the browser you already use.</p>
          <div className="home-final-actions">
            <StoreCta />
            <a href={EDGE_STORE_URL} target="_blank" rel="noopener noreferrer">Also available for Edge <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </div>
  );
}
