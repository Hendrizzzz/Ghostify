"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  PEOPLE,
  PROOF_COPY,
  SETTING_FOR,
  STAGE_COPY,
  STORE_LINKS,
  type PlatformKey,
  type SettingId,
  type SignalAction,
} from "./demo-stage-data";
import { GhostifyPopupModule } from "./ghostify-popup-module";

/* ─────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────────── */
type PersonId = "mira" | "theo" | "lina" | "nova" | "rafi";

interface TourStep {
  delay: number;               // ms from previous step
  action: () => void;
}

const PLATFORMS: PlatformKey[] = ["messenger", "facebook", "instagram"];

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  messenger: "Messenger",
  facebook: "Facebook",
  instagram: "Instagram",
};

const PLATFORM_URLS: Record<PlatformKey, string> = {
  messenger: "messenger.com",
  facebook: "facebook.com",
  instagram: "instagram.com",
};

/* Conversation data per platform */
const CONV: Record<PlatformKey, { person: PersonId; incoming: string; outgoing: string }> = {
  messenger: {
    person: "mira",
    incoming: "Are you there?",
    outgoing: "Reading. Not broadcasting yet.",
  },
  facebook: {
    person: "theo",
    incoming: "Can you check this story?",
    outgoing: "Viewing now. No trace left.",
  },
  instagram: {
    person: "lina",
    incoming: "Did you see this?",
    outgoing: "Reading quietly over here.",
  },
};

const DEFAULT_SETTINGS: Record<SettingId, boolean> = {
  "ig-seen": true,
  "ig-typing": true,
  "ig-story": true,
  "msg-seen": true,
  "msg-typing": true,
  "msg-story": true,
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function SplitSignalHero() {
  const [platform, setPlatform] = useState<PlatformKey>("messenger");
  const [settings, setSettings] = useState<Record<SettingId, boolean>>(DEFAULT_SETTINGS);
  const [activeSetting, setActiveSetting] = useState<SettingId>("msg-seen");
  const [showTyping, setShowTyping] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [dividerRipple, setDividerRipple] = useState(false);
  const [tourActive, setTourActive] = useState(true);
  const dividerRef = useRef<HTMLDivElement>(null);
  const tourRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* resolve current signal action */
  const currentAction: SignalAction = showStory ? "story" : showTyping ? "typing" : "seen";
  const settingId = SETTING_FOR[platform][currentAction];
  const isProtected = settings[settingId];

  const conv = CONV[platform];
  const person = PEOPLE[conv.person];
  const proof = PROOF_COPY[currentAction][isProtected ? "protected" : "exposed"];

  /* toggle a setting */
  const handleToggle = useCallback((id: SettingId) => {
    setSettings((s) => ({ ...s, [id]: !s[id] }));
    setActiveSetting(id);
    setTourActive(false); // user interacted — stop tour
    // trigger divider ripple
    setDividerRipple(false);
    requestAnimationFrame(() => setDividerRipple(true));
    setTimeout(() => setDividerRipple(false), 600);
  }, []);

  /* autoplay tour */
  useEffect(() => {
    if (!tourActive) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    function q(delay: number, fn: () => void) {
      timers.push(setTimeout(fn, delay));
    }

    /* tour: toggle msg-seen OFF → restore → switch FB → switch IG → typing toggle → loop */
    q(1500,  () => setActiveSetting("msg-seen"));
    q(2400,  () => {
      setSettings((s) => ({ ...s, "msg-seen": false }));
      setDividerRipple(true);
      setTimeout(() => setDividerRipple(false), 700);
    });
    q(4600,  () => {
      setSettings((s) => ({ ...s, "msg-seen": true }));
      setDividerRipple(true);
      setTimeout(() => setDividerRipple(false), 700);
    });
    q(5600,  () => setPlatform("facebook"));
    q(6400,  () => { setShowStory(true); setActiveSetting("msg-story"); });
    q(8400,  () => {
      setSettings((s) => ({ ...s, "msg-story": false }));
      setDividerRipple(true);
      setTimeout(() => setDividerRipple(false), 700);
    });
    q(10200, () => { setShowStory(false); setSettings((s) => ({ ...s, "msg-story": true })); });
    q(11000, () => setPlatform("instagram"));
    q(11800, () => setActiveSetting("ig-seen"));
    q(12600, () => { setShowTyping(true); setActiveSetting("ig-typing"); });
    q(14400, () => {
      setSettings((s) => ({ ...s, "ig-typing": false }));
      setDividerRipple(true);
      setTimeout(() => setDividerRipple(false), 700);
    });
    q(16200, () => {
      setSettings((s) => ({ ...s, "ig-typing": true }));
      setShowTyping(false);
    });
    q(17200, () => setPlatform("messenger"));
    q(17800, () => setActiveSetting("msg-seen"));

    tourRef.current = timers;
    return () => timers.forEach(clearTimeout);
    // loop every ~18s
  }, [tourActive, platform]); // eslint-disable-line react-hooks/exhaustive-deps

  /* loop tour */
  useEffect(() => {
    if (!tourActive) return;
    const loop = setTimeout(() => {
      // reset state and restart
      setSettings(DEFAULT_SETTINGS);
      setPlatform("messenger");
      setShowTyping(false);
      setShowStory(false);
    }, 18000);
    return () => clearTimeout(loop);
  }, [tourActive, settings]);

  return (
    <section className="split-hero" aria-label="Ghostify Signal Blackout hero">
      {/* ── NAV ── */}
      <nav className="site-nav" aria-label="Site navigation">
        <a href="/" className="site-nav-brand">
          <GhostIcon />
          Ghostify
        </a>
        <div className="site-nav-links">
          <a href={STORE_LINKS.github} target="_blank" rel="noreferrer">Source</a>
          <a href="#matrix">How it works</a>
          <a
            href={STORE_LINKS.chrome}
            target="_blank"
            rel="noreferrer"
            className="nav-cta"
          >
            <ChromeIcon />
            Add to Chrome
          </a>
        </div>
      </nav>

      {/* ── HEADLINE ── */}
      <div className="hero-headline">
        <h1>Browse normally.<br />Keep signals local.</h1>
        <p className="hero-sub">
          {STAGE_COPY.support}
        </p>
      </div>

      {/* ── SPLIT STAGE ── */}
      <div className="split-stage">
        {/* LEFT — Your browser */}
        <div className="split-left">
          <div className="split-panel-label">Your browser</div>

          {/* Browser window */}
          <div className="browser-window" role="img" aria-label={`Your ${PLATFORM_LABELS[platform]} with Ghostify active`}>
            {/* Chrome bar */}
            <div className="browser-chrome">
              <div className="browser-dots">
                <span /><span /><span />
              </div>
              {/* Platform tabs */}
              <div className="platform-tabs">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    className={`platform-tab ${platform === p ? "active" : ""}`}
                    onClick={() => { setPlatform(p); setTourActive(false); }}
                    type="button"
                  >
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
              <div className="browser-url">
                <span className="url-lock" aria-hidden="true" />
                <span className="url-text">{PLATFORM_URLS[platform]}</span>
              </div>
              <div className="browser-ext-area">
                <div className="browser-ext-icon active" title="Ghostify extension popup" aria-label="Ghostify extension active">
                  👻
                </div>
              </div>

              {/* Popup anchored to chrome bar */}
              <GhostifyPopupModule
                settings={settings}
                activeSetting={activeSetting}
                onToggle={handleToggle}
              />
            </div>

            {/* Browser content */}
            <div className="browser-content">
              {showStory ? (
                <StoryView person={conv.person} platform={platform} />
              ) : (
                <ConversationView
                  person={conv.person}
                  platform={platform}
                  incoming={conv.incoming}
                  outgoing={isProtected ? proof.outgoing : PROOF_COPY[currentAction].exposed.outgoing}
                  showTyping={showTyping}
                  isProtected={isProtected}
                  currentAction={currentAction}
                />
              )}
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="split-divider" aria-hidden="true">
          <div className="split-divider-logo">👻</div>
          <div
            ref={dividerRef}
            className={`split-divider-line${dividerRipple ? " rippling" : ""}`}
          />
        </div>

        {/* RIGHT — Their device */}
        <div className="split-right">
          <div className="split-panel-label theirs">Their device</div>

          <div className="their-device" role="img" aria-label="What the other person sees">
            <div className="their-device-bar">
              <span className="their-dot" />
              <span>
                {PLATFORM_LABELS[platform]} — {person.name}
              </span>
            </div>

            <div className="their-conv">
              {/* Their sent message */}
              <div className="their-msg-row">
                <span
                  className={`person-avatar ${person.avatarClass}`}
                  style={{ width: 28, height: 28 }}
                  aria-hidden="true"
                />
                <div className="their-bubble">
                  {showStory
                    ? `Posted a story`
                    : conv.incoming}
                </div>
              </div>

              {/* Your reply — visible only if not protected (seen) */}
              {!showStory && (
                <div
                  className="their-sent-bubble"
                  style={{ opacity: isProtected ? 0.2 : 0.8, transition: "opacity 400ms" }}
                >
                  {isProtected ? "(no read signal)" : "Seen ✓✓"}
                </div>
              )}

              {/* Status line */}
              <div
                className={`their-status ${isProtected ? "protected" : "exposed"}`}
                role="status"
                aria-live="polite"
              >
                <span className="status-icon">{isProtected ? "🛡" : "⚠️"}</span>
                <span>{proof.status}</span>
              </div>

              {/* Proof detail */}
              <div style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.55, padding: "4px 0" }}>
                {proof.detail}
              </div>

              {/* Peer proof tag */}
              <div className="peer-card">
                <div className="peer-card-row">
                  <span
                    className={`person-avatar ${person.avatarClass}`}
                    style={{ width: 22, height: 22 }}
                    aria-hidden="true"
                  />
                  <strong>{person.name}</strong>
                  <span className={`proof-tag ${isProtected ? "green" : "red"}`}>
                    {proof.proof}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--faint)", paddingLeft: 30 }}>
                  {proof.preview}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="hero-cta-bar">
        <div className="trust-pills">
          {STAGE_COPY.trust.map((t) => (
            <span key={t} className="trust-pill">{t}</span>
          ))}
        </div>
        <div className="cta-group">
          <a
            href={STORE_LINKS.chrome}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            <ChromeIcon />
            Add to Chrome — it&apos;s free
          </a>
          <a
            href={STORE_LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <GitHubIcon />
            View source
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONVERSATION VIEW (Messenger / Instagram DM)
───────────────────────────────────────────────────────────── */
function ConversationView({
  person,
  platform,
  incoming,
  outgoing,
  showTyping,
  isProtected,
  currentAction,
}: {
  person: PersonId;
  platform: PlatformKey;
  incoming: string;
  outgoing: string;
  showTyping: boolean;
  isProtected: boolean;
  currentAction: SignalAction;
}) {
  const p = PEOPLE[person];
  const signalLabel =
    currentAction === "typing"
      ? "typing signal"
      : currentAction === "story"
        ? "story view"
        : "seen signal";

  return (
    <div className="conv-area">
      {/* Thread header */}
      <div className="conv-header">
        <div className="conv-avatar">
          <div className={`conv-avatar-inner person-avatar ${p.avatarClass}`} aria-hidden="true" />
          <div className="active-ring" style={{ opacity: 1 }} />
        </div>
        <div className="conv-info">
          <strong>{p.name}</strong>
          <span>Active now</span>
        </div>
      </div>

      {/* Messages */}
      <div className="conv-messages">
        <div className="msg-bubble incoming">{incoming}</div>
        <div
          className="msg-bubble outgoing"
          style={{ transition: "background 400ms" }}
        >
          {outgoing}
        </div>

        {/* Typing indicator */}
        {showTyping && (
          <div className="typing-bubble" aria-label="Composing message">
            <span /><span /><span />
          </div>
        )}
      </div>

      {/* Signal intercept visualization */}
      <div
        className={`signal-intercept ${isProtected ? "" : "exposed"}`}
        data-signal-blocked={isProtected}
        aria-label={
          isProtected
            ? `${signalLabel} blocked by Ghostify`
            : `${signalLabel} will be sent`
        }
      >
        <span className="shield-icon">{isProtected ? "🛡" : "📡"}</span>
        <div className="signal-track">
          <div className="signal-dot" />
        </div>
        <span className="signal-label">
          {isProtected
            ? `${signalLabel} → blocked`
            : `${signalLabel} → sending`}
        </span>
      </div>

      {/* Composer */}
      <div className="conv-composer">
        <input
          type="text"
          placeholder={`Message ${p.short}…`}
          readOnly
          aria-label="Message input (demo)"
        />
        <button className="conv-composer-send" aria-label="Send" type="button">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STORY VIEW  (Facebook / Instagram)
───────────────────────────────────────────────────────────── */
function StoryView({
  person,
  platform,
}: {
  person: PersonId;
  platform: PlatformKey;
}) {
  const p = PEOPLE[person];
  return (
    <div className="story-view">
      <div
        className="story-card"
        data-name={p.short}
        aria-label={`${p.name}'s story on ${platform}`}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            className={`person-avatar ${p.avatarClass}`}
            style={{ width: 22, height: 22 }}
            aria-hidden="true"
          />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
            {p.short}
          </span>
        </div>
        {/* story gradient content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))",
          }}
        />
      </div>
      <p className="story-view-label">
        Viewing {p.name}&apos;s story
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ICON ATOMS
───────────────────────────────────────────────────────────── */
function GhostIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 2C7.03 2 3 6.03 3 11v10l3-2 2 2 2-2 2 2 2-2 3 2V11C19 6.03 14.97 2 12 2z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="9" cy="11" r="1.2" fill="#050505" />
      <circle cx="15" cy="11" r="1.2" fill="#050505" />
    </svg>
  );
}

function ChromeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9" />
      <path d="M12 8h9.5M12 8a4 4 0 00-4 4M6.5 20.8L11 12.5M6.5 20.8A9.8 9.8 0 0012 22a10 10 0 009.5-6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
    </svg>
  );
}
