import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Chrome, Github, Globe } from 'lucide-react';
import { GhostMark } from './GhostSVG';

type HeroPlatform = 'messenger' | 'facebook' | 'instagram';
type HeroProofKind = 'messenger' | 'instagram' | 'facebook' | 'local' | 'source';

interface MsgControls {
  seen: boolean;
  typing: boolean;
  story: boolean;
}
interface UnreadBadges {
  sofia: boolean;
}

function dispatchMascot(type: string) {
  window.dispatchEvent(new CustomEvent('ghostify:mascot', { detail: { type } }));
}

function HeroProofIcon({ kind, label }: { kind: HeroProofKind; label: string }) {
  if (kind === 'messenger') {
    return (
      <svg width="19" height="19" viewBox="0 0 32 32" fill="none" aria-label={label}>
        <path
          d="M16 4C9.1 4 4 8.75 4 15.15c0 3.45 1.48 6.45 3.95 8.45v4.1c0 .72.77 1.18 1.39.82l3.55-2.05c1 .25 2.05.38 3.11.38 6.9 0 12-4.75 12-11.7S22.9 4 16 4Z"
          fill="url(#heroMessengerGradient)"
        />
        <path d="M9.2 18.8 14 13.7l3.42 3.52 5.38-5.52-4.8 7.88-3.52-3.52-5.28 2.74Z" fill="white" />
        <defs>
          <linearGradient id="heroMessengerGradient" x1="5" y1="27" x2="27" y2="5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078FF" />
            <stop offset="0.55" stopColor="#00C6FF" />
            <stop offset="1" stopColor="#A033FF" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (kind === 'instagram') {
    return (
      <svg width="19" height="19" viewBox="0 0 32 32" fill="none" aria-label={label}>
        <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#heroInstagramGradient)" />
        <rect x="9.4" y="9.4" width="13.2" height="13.2" rx="4" stroke="white" strokeWidth="2.2" />
        <circle cx="16" cy="16" r="3.8" stroke="white" strokeWidth="2.2" />
        <circle cx="21.2" cy="10.9" r="1.45" fill="white" />
        <defs>
          <linearGradient id="heroInstagramGradient" x1="6" y1="27" x2="27" y2="5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEDA75" />
            <stop offset="0.32" stopColor="#FA7E1E" />
            <stop offset="0.62" stopColor="#D62976" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (kind === 'facebook') {
    return (
      <svg width="19" height="19" viewBox="0 0 32 32" fill="none" aria-label={label}>
        <rect x="4" y="4" width="24" height="24" rx="7" fill="#1877F2" />
        <path
          d="M18.25 27.2v-9.55h3.2l.48-3.72h-3.68v-2.38c0-1.08.3-1.82 1.85-1.82h1.98V6.4c-.34-.05-1.52-.15-2.88-.15-2.85 0-4.8 1.74-4.8 4.94v2.74h-3.23v3.72h3.23v9.55h3.85Z"
          fill="white"
        />
      </svg>
    );
  }

  return kind === 'local' ? <Globe size={16} aria-label={label} /> : <Github size={15} aria-label={label} />;
}

/* ── Cursor waypoints (% of browser container dims) ──── */
const P = {
  rest:        { x: 60, y: 72 },
  extIcon:     { x: 96.4, y: 10 }, // far-right tab bar, extension icon
  msgTab:      { x: 9,  y: 10 },
  fbTab:       { x: 22, y: 10 },
  igTab:       { x: 34, y: 10 },
  sofiaChat:   { x: 14, y: 34 },   // first chat in messenger list
  igUnreadDM:  { x: 4,  y: 54 },   // h.nakano DM (3rd item in IG left rail)
  fbUnreadDM:  { x: 14, y: 30 },   // ryan DM (first item in FB list)
  composer:    { x: 56, y: 95 },
  storyBubble: { x: 4,  y: 23 },   // first story circle in IG left rail
  chatArea:    { x: 56, y: 64 },
  mfSeenToggle:{ x: 95, y: 54 },   // "Hide Seen" toggle in M/F popup group
} as const;

type CursorTarget = keyof typeof P;

const CURSOR_ANCHORS: Partial<Record<CursorTarget, { x: number; y: number }>> = {
  composer: { x: 0.5, y: 0.52 },
  chatArea: { x: 0.58, y: 0.56 },
  extIcon: { x: 0.5, y: 0.52 },
  mfSeenToggle: { x: 0.5, y: 0.5 },
};

/* ── Demo cursor ─────────────────────────────────────── */
function DemoCursor({ x, y, clickKey, target }: { x: number; y: number; clickKey: number; target: CursorTarget }) {
  return (
    <div
      data-hero-cursor
      data-current-target={target}
      data-click-key={clickKey}
      style={{
        position: 'absolute',
        left: `${x}%`, top: `${y}%`,
        transform: 'translate(-2px, -2px)',
        transition: 'left 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        zIndex: 50, pointerEvents: 'none',
      }}
    >
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
        <path d="M2 2L2 19L6 15L9 22L11.5 21L8.5 14L14.5 14L2 2Z" fill="white" stroke="rgba(0,0,0,0.55)" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={clickKey}
          initial={{ scale: 0.2, opacity: 0.85 }}
          animate={{ scale: 3.2, opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ position: 'absolute', top: -9, left: -9, width: 22, height: 22, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.75)', pointerEvents: 'none' }}
        />
      </AnimatePresence>
    </div>
  );
}

/* ── Visual toggle (display-only, state-driven) ─────── */
function PopupToggle({ on, cursorTarget }: { on: boolean; cursorTarget?: CursorTarget }) {
  return (
    <div data-cursor-target={cursorTarget} style={{ width: 32, height: 18, borderRadius: 9, backgroundColor: on ? 'var(--g-accent)' : 'rgba(240,230,210,0.14)', position: 'relative', flexShrink: 0, overflow: 'hidden', contain: 'paint', transition: 'background-color 0.42s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div style={{ position: 'absolute', top: 3, left: 3, width: 12, height: 12, borderRadius: 6, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transform: on ? 'translate3d(14px, 0, 0)' : 'translate3d(0, 0, 0)', transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)', willChange: 'transform', backfaceVisibility: 'hidden' }} />
    </div>
  );
}

/* ── Ghostify popup — matches demo panel style ───────── */
function GhostifyHeroPopup({
  open, platform, msControls, igControls,
}: {
  open: boolean;
  platform: HeroPlatform;
  msControls: MsgControls;
  igControls: MsgControls;
}) {
  const groups = [
    { label: 'Instagram', platforms: ['instagram'] as HeroPlatform[], controls: igControls },
    { label: 'Messenger / Facebook', platforms: ['messenger', 'facebook'] as HeroPlatform[], controls: msControls },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div style={{ position: 'absolute', top: 68, right: 6, zIndex: 30 }}>
          {/* Caret */}
          <div style={{ position: 'absolute', top: -6, right: 8, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid rgba(240,230,210,0.09)', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: -5, right: 8, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #141210', zIndex: 2 }} />

          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: 220, background: '#141210', border: '1px solid rgba(240,230,210,0.09)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', position: 'relative', zIndex: 3 }}
          >
            {/* Header */}
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(240,230,210,0.06)' }}>
              <GhostMark size={16} />
              <span style={{ fontFamily: 'var(--g-display)', fontSize: 13.5, fontWeight: 500, color: 'var(--g-white)', letterSpacing: '0.02em' }}>Ghostify</span>
              <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: 4, background: 'var(--g-accent)', boxShadow: '0 0 6px var(--g-accent)' }} />
            </div>

            {/* Groups */}
            {groups.map((group, gi) => {
              const isActive = group.platforms.includes(platform);
              return (
                <div key={group.label} style={{ borderBottom: gi < groups.length - 1 ? '1px solid rgba(240,230,210,0.05)' : 'none', opacity: isActive ? 1 : 0.48, transition: 'opacity 0.2s ease' }}>
                  <div style={{ padding: '8px 14px 4px' }}>
                    <span style={{ fontFamily: 'var(--g-mono)', fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: isActive ? 'rgba(196,72,48,0.7)' : 'rgba(240,230,210,0.26)' }}>
                      {group.label}
                    </span>
                  </div>
                  {[
                    { key: 'seen' as const, label: 'Hide Seen' },
                    { key: 'typing' as const, label: 'Hide Typing' },
                    { key: 'story' as const, label: 'Hide Story Views' },
                  ].map((item) => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 14px' }}>
                      <span style={{ fontFamily: 'var(--g-sans)', fontSize: 11.5, color: 'rgba(240,230,210,0.7)' }}>{item.label}</span>
                      <PopupToggle
                        on={group.controls[item.key]}
                        cursorTarget={group.label === 'Messenger / Facebook' && item.key === 'seen' ? 'mfSeenToggle' : undefined}
                      />
                    </div>
                  ))}
                  <div style={{ height: 6 }} />
                </div>
              );
            })}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Messenger chat data ──────────────────────────────── */
const CHATS = [
  { id: 'sofia',  name: 'Sofia 💕',   preview: 'ok fine whatever 🙄',              time: '9:41', color: '#FF6D00', unreadCount: 3 },
  { id: 'jamie',  name: 'Jamie',      preview: 'ok but we need to talk 👀',         time: '9:22', color: '#7C4DFF' },
  { id: 'alex',   name: 'Alex Chen',  preview: 'did you see what just happened',    time: 'Mon',  color: '#0082FB' },
  { id: 'priya',  name: 'Priya K.',   preview: 'ok send me everything',             time: 'Sun',  color: '#00BFA5' },
];

const THREADS: Record<string, { them: boolean; text: string }[]> = {
  sofia: [
    { them: false, text: 'lol yeah I know right 😂' },
    { them: true,  text: 'hey are you ignoring me' },
    { them: true,  text: 'I know you\'re online' },
    { them: true,  text: 'ok fine whatever 🙄' },
  ],
  jamie: [
    { them: true,  text: 'stop you\'re so bad 😭' },
    { them: false, text: 'haha okay okay' },
    { them: true,  text: 'last night was actually so fun' },
    { them: false, text: 'tell me about it 😏' },
    { them: true,  text: 'ok but we need to talk 👀' },
  ],
  alex: [
    { them: true,  text: 'bro what are you doing tonight' },
    { them: false, text: 'nothing why' },
    { them: true,  text: 'did you see what just happened' },
  ],
  priya: [
    { them: true,  text: 'the drama today omg 💀' },
    { them: false, text: 'RIGHT' },
    { them: true,  text: 'ok send me everything' },
  ],
};

function MessengerView({
  activeChatId, typingText, unreadBadges, composerFocused,
}: {
  activeChatId: string;
  typingText: string;
  unreadBadges: UnreadBadges;
  composerFocused: boolean;
}) {
  const activeChat = CHATS.find((c) => c.id === activeChatId) ?? CHATS[0];
  const messages = THREADS[activeChatId] ?? THREADS.alex;

  return (
    <div style={{ height: '100%', display: 'flex', background: '#18202E', overflow: 'hidden' }}>
      {/* Chat list */}
      <div className="hero-chat-list hero-chat-list-messenger" style={{ width: 196, borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px 8px', fontFamily: 'var(--g-sans)', fontSize: 17, fontWeight: 700, color: 'white' }}>Chats</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 6px', overflow: 'hidden' }}>
          {CHATS.map((chat) => {
            const hasBadge = chat.unreadCount && (chat.id === 'sofia' ? unreadBadges.sofia : false);
            return (
              <div
                key={chat.id}
                data-cursor-target={chat.id === 'sofia' ? 'sofiaChat' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', borderRadius: 8,
                  background: chat.id === activeChatId ? 'rgba(0,130,251,0.15)' : 'transparent',
                  flexShrink: 0,
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 33, height: 33, borderRadius: 17, background: chat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', fontFamily: 'var(--g-sans)' }}>
                    {chat.name[0]}
                  </div>
                  {chat.id === activeChatId && (
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 8, height: 8, borderRadius: 4, background: '#44b244', border: '1.5px solid #18202E' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--g-sans)', fontSize: 12.5, fontWeight: hasBadge ? 700 : (chat.id === activeChatId ? 600 : 400), color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.name}
                  </div>
                  <div style={{ fontFamily: 'var(--g-sans)', fontSize: 11, color: hasBadge ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.preview}
                  </div>
                </div>
                {hasBadge && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <span style={{ fontSize: 9.5, color: '#0082FB', fontFamily: 'var(--g-sans)' }}>{chat.time}</span>
                    <div style={{ width: 17, height: 17, borderRadius: 9, background: '#0082FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: 'white', fontFamily: 'var(--g-sans)' }}>
                      {chat.unreadCount}
                    </div>
                  </div>
                )}
                {!hasBadge && (
                  <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--g-sans)', flexShrink: 0 }}>{chat.time}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Thread */}
      <div className="hero-thread" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: activeChat.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', fontFamily: 'var(--g-sans)' }}>
            {activeChat.name[0]}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--g-sans)', fontSize: 13, fontWeight: 600, color: 'white' }}>{activeChat.name}</div>
            <div style={{ fontFamily: 'var(--g-sans)', fontSize: 10.5, color: 'rgba(255,255,255,0.35)' }}>Active now</div>
          </div>
        </div>

        <div data-cursor-target="chatArea" style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeChatId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.them ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth: '72%', padding: '7px 11px', borderRadius: msg.them ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: msg.them ? 'rgba(255,255,255,0.09)' : '#0082FB', fontFamily: 'var(--g-sans)', fontSize: 12.5, color: 'white', lineHeight: 1.4 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Composer */}
        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div data-cursor-target="composer" style={{ height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.07)', padding: '0 13px', fontFamily: 'var(--g-sans)', fontSize: 12.5, color: typingText ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>
            {typingText || (composerFocused ? '' : 'Aa')}
            {(typingText || composerFocused) && <span style={{ display: 'inline-block', width: 1, height: 14, background: '#0082FB', marginLeft: typingText ? 1 : 0, animation: 'ghostBlink 1s ease-in-out infinite', verticalAlign: 'middle' }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Instagram DM threads for hero ─────────────────────── */
const HERO_IG_THREADS: Record<string, { them: boolean; text: string }[]> = {
  'cami.v':   [
    { them: true,  text: 'ok ok ok' },
    { them: true,  text: 'watch her story RIGHT NOW' },
    { them: false, text: 'omg' },
    { them: true,  text: 'RIGHT??' },
    { them: false, text: 'I\'m watching' },
  ],
  'h.nakano': [
    { them: false, text: 'did you see what happened' },
    { them: true,  text: 'WAIT' },
    { them: true,  text: 'no way are you serious' },
    { them: true,  text: 'wait did you see that??' },
  ],
  'marco_p':  [
    { them: true,  text: 'ok I sent it' },
    { them: false, text: 'checking now' },
    { them: true,  text: 'lmk what you think' },
  ],
  'sol.r':    [
    { them: true,  text: 'omg no way' },
    { them: false, text: 'I know right' },
  ],
};

/* ── Instagram view ───────────────────────────────────── */
function InstagramView({ showStory, igUnreadBadge, activeIgDm }: { showStory: boolean; igUnreadBadge: boolean; activeIgDm: string }) {
  const stories = [
    { name: 'cami.v',   color: '#E1306C' },
    { name: 'marco_p',  color: '#FF6D00' },
    { name: 'h.nakano', color: '#7C4DFF' },
    { name: 'sol.r',    color: '#00BFA5' },
  ];
  const dms = [
    { name: 'cami.v',   msg: 'You: I\'m watching',      color: '#E1306C', unreadCount: 0 },
    { name: 'marco_p',  msg: 'ok I sent it',             color: '#FF6D00', unreadCount: 0 },
    { name: 'h.nakano', msg: 'wait did you see that??',  color: '#7C4DFF', unreadCount: 2 },
    { name: 'sol.r',    msg: 'omg no way',               color: '#00BFA5', unreadCount: 0 },
  ];
  const activeDm = dms.find(d => d.name === activeIgDm) ?? dms[0];
  const thread = HERO_IG_THREADS[activeIgDm] ?? HERO_IG_THREADS['cami.v'];

  return (
    <div style={{ height: '100%', display: 'flex', background: '#000', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence>
        {showStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 3 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1, overflow: 'hidden' }}>
                  {i === 1 && <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'linear' }} style={{ height: '100%', background: 'white', borderRadius: 1 }} />}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 22, left: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.25)', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', fontFamily: 'var(--g-sans)' }}>C</div>
              <div>
                <div style={{ fontFamily: 'var(--g-sans)', fontSize: 11.5, fontWeight: 600, color: 'white' }}>cami.v</div>
                <div style={{ fontFamily: 'var(--g-sans)', fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>5m ago</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
              <div style={{ fontFamily: 'var(--g-display)', fontSize: 28, fontStyle: 'italic', color: 'white', fontWeight: 300, lineHeight: 1.2 }}>golden hour</div>
              <div style={{ fontFamily: 'var(--g-sans)', fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>kyoto → everywhere</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left panel: story row + DM list */}
      <div className="hero-chat-list hero-chat-list-instagram" style={{ width: 210, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        {/* Story circles */}
        <div style={{ padding: '8px 8px 6px', display: 'flex', gap: 6, flexShrink: 0 }}>
          {stories.map((s, i) => (
            <div key={s.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div data-cursor-target={i === 0 ? 'storyBubble' : undefined} style={{ width: 36, height: 36, borderRadius: 18, padding: s.active ? 2 : 0, background: s.active ? 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #bc1888)' : 'rgba(255,255,255,0.06)' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 16, background: s.color, border: s.active ? '1.5px solid #000' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', fontFamily: 'var(--g-sans)' }}>
                  {s.name[0].toUpperCase()}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--g-sans)', fontSize: 8.5, color: 'rgba(255,255,255,0.38)' }}>{s.name.split('.')[0]}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 8px 4px', flexShrink: 0 }} />
        {/* DM list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 5px', overflow: 'hidden' }}>
          {dms.map((dm) => {
            const showBadge = dm.unreadCount > 0 && dm.name === 'h.nakano' && igUnreadBadge;
            return (
              <div key={dm.name} data-cursor-target={dm.name === 'h.nakano' ? 'igUnreadDM' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 6px', borderRadius: 8, background: dm.name === activeIgDm ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                <div style={{ width: 33, height: 33, borderRadius: 17, background: dm.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', fontFamily: 'var(--g-sans)' }}>
                  {dm.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--g-sans)', fontSize: 12.5, fontWeight: (dm.active || showBadge) ? 600 : 400, color: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dm.name}</div>
                  <div style={{ fontFamily: 'var(--g-sans)', fontSize: 11, color: showBadge ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.32)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dm.msg}</div>
                </div>
                {showBadge && (
                  <div style={{ width: 17, height: 17, borderRadius: 9, background: '#E1306C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: 'white', fontFamily: 'var(--g-sans)', flexShrink: 0 }}>
                    {dm.unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active thread */}
      <div className="hero-thread" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 13px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: activeDm.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', fontFamily: 'var(--g-sans)' }}>{activeDm.name[0].toUpperCase()}</div>
          <div>
            <div style={{ fontFamily: 'var(--g-sans)', fontSize: 13, fontWeight: 600, color: 'white' }}>{activeDm.name}</div>
            <div style={{ fontFamily: 'var(--g-sans)', fontSize: 10.5, color: 'rgba(255,255,255,0.35)' }}>Active now</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeIgDm} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {thread.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.them ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth: '72%', padding: '7px 11px', borderRadius: msg.them ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: msg.them ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #833ab4, #fd1d1d)', fontFamily: 'var(--g-sans)', fontSize: 12.5, color: 'white', lineHeight: 1.4 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.07)', padding: '0 13px', fontFamily: 'var(--g-sans)', fontSize: 12.5, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>Message...</div>
        </div>
      </div>
    </div>
  );
}

/* ── Facebook view ────────────────────────────────────── */
const FB_CHATS = [
  { id: 'ryan',   name: 'Ryan M.',       preview: 'you need to see this',         time: '3:44', color: '#1877F2', unreadCount: 2 },
  { id: 'claire', name: 'Claire B.',     preview: 'okay but that was funny',      time: '2:11', color: '#9C5CF5' },
  { id: 'group',  name: 'Friend group',  preview: 'nobody asked lmao',            time: '1:30', color: '#E9376C' },
];

const FB_THREADS: Record<string, { them: boolean; text: string }[]> = {
  ryan: [
    { them: false, text: 'what happened at the party' },
    { them: true,  text: 'ok so' },
    { them: true,  text: 'you need to see this' },
  ],
  claire: [
    { them: true,  text: 'did you tell anyone yet' },
    { them: false, text: 'obviously not' },
    { them: true,  text: 'okay but that was funny' },
  ],
  group: [
    { them: true,  text: 'someone show up late again' },
    { them: false, text: 'it was NOT me this time' },
    { them: true,  text: 'nobody asked lmao' },
  ],
};

function FacebookView({ activeChatId, fbUnreadBadge }: { activeChatId: string; fbUnreadBadge: boolean }) {
  const activeChat = FB_CHATS.find(c => c.id === activeChatId) ?? FB_CHATS[1];
  const messages = FB_THREADS[activeChatId] ?? FB_THREADS.claire;

  return (
    <div style={{ height: '100%', display: 'flex', background: '#18191A', overflow: 'hidden' }}>
      {/* Chat list */}
      <div className="hero-chat-list hero-chat-list-facebook" style={{ width: 196, borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px 8px', fontFamily: 'var(--g-sans)', fontSize: 16, fontWeight: 700, color: 'white' }}>Chats</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 6px', overflow: 'hidden' }}>
          {FB_CHATS.map((chat) => {
            const showBadge = chat.unreadCount && chat.id === 'ryan' && fbUnreadBadge;
            return (
              <div key={chat.id} data-cursor-target={chat.id === 'ryan' ? 'fbUnreadDM' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', borderRadius: 8, background: chat.id === activeChatId ? 'rgba(24,119,242,0.14)' : 'transparent', flexShrink: 0 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 33, height: 33, borderRadius: 17, background: chat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', fontFamily: 'var(--g-sans)' }}>
                    {chat.name[0]}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--g-sans)', fontSize: 12.5, fontWeight: showBadge ? 700 : (chat.id === activeChatId ? 600 : 400), color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.name}
                  </div>
                  <div style={{ fontFamily: 'var(--g-sans)', fontSize: 11, color: showBadge ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.preview}
                  </div>
                </div>
                {showBadge ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <span style={{ fontSize: 9.5, color: '#1877F2', fontFamily: 'var(--g-sans)' }}>{chat.time}</span>
                    <div style={{ width: 17, height: 17, borderRadius: 9, background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: 'white', fontFamily: 'var(--g-sans)' }}>
                      {chat.unreadCount}
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--g-sans)', flexShrink: 0 }}>{chat.time}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Thread */}
      <div className="hero-thread" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: activeChat.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', fontFamily: 'var(--g-sans)' }}>
            {activeChat.name[0]}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--g-sans)', fontSize: 13, fontWeight: 600, color: 'white' }}>{activeChat.name}</div>
            <div style={{ fontFamily: 'var(--g-sans)', fontSize: 10.5, color: 'rgba(255,255,255,0.35)' }}>Active now</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden', justifyContent: 'flex-end' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeChatId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.them ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth: '72%', padding: '7px 11px', borderRadius: msg.them ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: msg.them ? 'rgba(255,255,255,0.08)' : '#1877F2', fontFamily: 'var(--g-sans)', fontSize: 12.5, color: 'white', lineHeight: 1.4 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.07)', padding: '0 13px', fontFamily: 'var(--g-sans)', fontSize: 12.5, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>
            Aa
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Browser scene with autoplay ─────────────────────── */
function HeroBrowserScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  // Intersection observer — stops autoplay when hero scrolls out of view
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const [popupOpen, setPopupOpen]         = useState(false);
  const [msControls, setMsControls]       = useState<MsgControls>({ seen: true, typing: true, story: true });
  const [igControls]                      = useState<MsgControls>({ seen: true, typing: true, story: true });
  const [activePlatform, setActivePlat]   = useState<HeroPlatform>('messenger');
  const [activeChatId, setActiveChatId]   = useState('jamie');
  const [fbActiveChatId, setFbActiveChatId] = useState('claire');
  const [activeIgDm, setActiveIgDm]       = useState('cami.v');
  const [typingText, setTypingText]       = useState('');
  const [composerFocused, setComposerFocused] = useState(false);
  const [showStory, setShowStory]         = useState(false);
  const [cursorPos, setCursorPos]         = useState(P.rest);
  const [clickKey, setClickKey]           = useState(0);
  const [unreadBadges, setUnreadBadges]   = useState<UnreadBadges>({ sofia: true });
  const [igUnreadBadge, setIgUnreadBadge] = useState(true);
  const [fbUnreadBadge, setFbUnreadBadge] = useState(true);

  const typingTimer = useRef<ReturnType<typeof setInterval>>();
  const [cursorTarget, setCursorTarget] = useState<CursorTarget>('rest');

  const resolveCursorTarget = useCallback((target: CursorTarget) => {
    const fallback = P[target];
    const root = containerRef.current;
    const el = root?.querySelector<HTMLElement>(`[data-cursor-target="${target}"]`);
    if (!root || !el) return fallback;

    const rootRect = root.getBoundingClientRect();
    const targetRect = el.getBoundingClientRect();
    if (!rootRect.width || !rootRect.height || !targetRect.width || !targetRect.height) return fallback;

    const anchor = CURSOR_ANCHORS[target] ?? { x: 0.5, y: 0.5 };
    const x = ((targetRect.left - rootRect.left + targetRect.width * anchor.x) / rootRect.width) * 100;
    const y = ((targetRect.top - rootRect.top + targetRect.height * anchor.y) / rootRect.height) * 100;

    return {
      x: Math.max(0.75, Math.min(99.25, x)),
      y: Math.max(0.75, Math.min(99.25, y)),
    };
  }, []);

  const moveCursor = useCallback((target: CursorTarget) => {
    setCursorTarget(target);
    setCursorPos(resolveCursorTarget(target));
    requestAnimationFrame(() => setCursorPos(resolveCursorTarget(target)));
    window.setTimeout(() => setCursorPos(resolveCursorTarget(target)), 80);
  }, [resolveCursorTarget]);

  useEffect(() => {
    const syncCursorToLayout = () => setCursorPos(resolveCursorTarget(cursorTarget));
    window.addEventListener('resize', syncCursorToLayout);
    return () => window.removeEventListener('resize', syncCursorToLayout);
  }, [cursorTarget, resolveCursorTarget]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setCursorPos(resolveCursorTarget(cursorTarget)));
    const timer = window.setTimeout(() => setCursorPos(resolveCursorTarget(cursorTarget)), 90);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [activeChatId, activeIgDm, activePlatform, composerFocused, cursorTarget, fbActiveChatId, popupOpen, resolveCursorTarget]);

  // Autoplay loop — restarts when heroVisible changes to true
  useEffect(() => {
    if (!heroVisible) {
      setPopupOpen(false);
      setTypingText('');
      setComposerFocused(false);
      setShowStory(false);
      clearInterval(typingTimer.current);
      dispatchMascot('typing-stop');
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, ms)); };

    const TYPING_TEXT = 'babe I was literally just about to text you';

    const startTyping = (text: string, speed = 90) => {
      clearInterval(typingTimer.current);
      setTypingText('');
      dispatchMascot('typing-start');
      let i = 0;
      typingTimer.current = setInterval(() => {
        i++;
        setTypingText(text.slice(0, i));
        dispatchMascot('typing-active');
        if (i >= text.length) clearInterval(typingTimer.current);
      }, speed);
    };

    const startDeleting = (speed = 55) => {
      clearInterval(typingTimer.current);
      dispatchMascot('typing-active');
      typingTimer.current = setInterval(() => {
        setTypingText(prev => {
          dispatchMascot('typing-active');
          if (prev.length <= 1) {
            clearInterval(typingTimer.current);
            dispatchMascot('typing-stop');
            return '';
          }
          return prev.slice(0, -1);
        });
      }, speed);
    };

    // Typing duration: 45 chars * 90ms = 4050ms
    // Deleting duration: 45 chars * 55ms = 2475ms
    const TYPING_MS  = TYPING_TEXT.length * 90;
    const DELETING_MS = TYPING_TEXT.length * 55;
    const TYPING_START_AT = 10700;
    const COMPOSER_FOCUS_AT = TYPING_START_AT - 400;

    function loop() {
      /* ── Full reset ─────────────────────────────────── */
      setPopupOpen(false);
      setActivePlat('messenger');
      setActiveChatId('jamie');
      setFbActiveChatId('claire');
      setActiveIgDm('cami.v');
      setTypingText('');
      setComposerFocused(false);
      setShowStory(false);
      moveCursor('rest');
      setMsControls({ seen: true, typing: true, story: true });
      setUnreadBadges({ sofia: true });
      setIgUnreadBadge(true);
      setFbUnreadBadge(true);
      dispatchMascot('typing-stop');

      /* ── Beat 1: Open Ghostify popup ─────────────── */
      // Start on Jamie's chat (the fling), cursor moves to extension icon
      t(1200, () => moveCursor('extIcon'));
      t(2500, () => { setPopupOpen(true); setClickKey(k => k + 1); });
      // popup open ~2s — user sees all controls are ON

      /* ── Beat 2: Close popup, open Sofia's chat ──── */
      // Sofia = GF, 3 unread. Badge stays because Ghostify holds the receipt
      // Cursor is already at extIcon — click it again to dismiss the popup
      t(4500, () => setClickKey(k => k + 1));          // click ext icon
      t(4650, () => setPopupOpen(false));              // popup closes
      t(5100, () => moveCursor('chatArea'));           // cursor drifts into chat area
      t(6000, () => moveCursor('sofiaChat'));
      t(6800, () => {
        setActiveChatId('sofia');
        setClickKey(k => k + 1);
        dispatchMascot('chat-open'); // "seen stayed back."
      });

      /* ── Beat 3: Type then DELETE in Sofia's composer ─ */
      t(9500, () => moveCursor('composer'));
      t(COMPOSER_FOCUS_AT, () => {
        setComposerFocused(true);
        setClickKey(k => k + 1);
      });
      t(TYPING_START_AT, () => {
        setComposerFocused(true);
        startTyping(TYPING_TEXT, 90);
      });
      // Typing finishes at ~10000 + TYPING_MS — pause before deleting
      t(TYPING_START_AT + TYPING_MS + 1000, () => startDeleting(55));
      // Deletion finishes — cursor rests, then after a beat moves to Instagram tab
      t(TYPING_START_AT + TYPING_MS + DELETING_MS + 1400, () => {
        clearInterval(typingTimer.current);
        setTypingText('');
        setComposerFocused(false);
        moveCursor('chatArea'); // rest in chat area first
        dispatchMascot('typing-stop');
      });
      t(TYPING_START_AT + TYPING_MS + DELETING_MS + 2800, () => moveCursor('igTab')); // then drift to tab

      const afterDelete = TYPING_START_AT + TYPING_MS + DELETING_MS + 3600;

      /* ── Beat 4: Instagram — click unread DM ──────── */
      t(afterDelete,        () => { setActivePlat('instagram'); setClickKey(k => k + 1); });
      t(afterDelete + 1200, () => moveCursor('igUnreadDM'));
      t(afterDelete + 1900, () => {
        setActiveIgDm('h.nakano'); // switch to the unread DM thread
        setClickKey(k => k + 1);
        dispatchMascot('chat-open'); // "seen stayed back."
      });

      /* ── Beat 4b: Instagram — watch story ──────────── */
      t(afterDelete + 4500, () => moveCursor('storyBubble'));
      t(afterDelete + 5200, () => {
        setShowStory(true);
        setClickKey(k => k + 1);
        dispatchMascot('story-view'); // "story stayed quiet."
      });
      t(afterDelete + 10200, () => setShowStory(false));

      /* ── Beat 5: Disable seen, switch to Facebook ─── */
      t(afterDelete + 11500, () => moveCursor('extIcon'));
      t(afterDelete + 12400, () => { setPopupOpen(true); setClickKey(k => k + 1); });
      t(afterDelete + 13700, () => moveCursor('mfSeenToggle')); // cursor moves inside popup
      t(afterDelete + 14800, () => { setMsControls(prev => ({ ...prev, seen: false })); setClickKey(k => k + 1); }); // click toggle
      // Close popup: cursor moves back to ext icon, clicks to close
      t(afterDelete + 16100, () => moveCursor('extIcon'));
      t(afterDelete + 17000, () => { setClickKey(k => k + 1); setPopupOpen(false); });
      // Switch to Facebook tab
      t(afterDelete + 17900, () => moveCursor('fbTab'));
      t(afterDelete + 18800, () => { setActivePlat('facebook'); setClickKey(k => k + 1); });

      /* ── Beat 6: Click FB unread — badge disappears ─ */
      // seen is now OFF — receipt gets sent normally
      t(afterDelete + 20200, () => moveCursor('fbUnreadDM'));
      t(afterDelete + 21100, () => {
        setFbActiveChatId('ryan');
        setFbUnreadBadge(false); // badge gone — receipt sent
        setClickKey(k => k + 1);
        dispatchMascot('feature-off'); // "that one went through."
      });

      /* ── Beat 7: Re-enable seen, close popup, loop ── */
      t(afterDelete + 24600, () => moveCursor('extIcon'));
      t(afterDelete + 25500, () => { setPopupOpen(true); setClickKey(k => k + 1); });
      t(afterDelete + 26800, () => moveCursor('mfSeenToggle')); // cursor moves to toggle
      t(afterDelete + 27900, () => { setMsControls(prev => ({ ...prev, seen: true })); setClickKey(k => k + 1); }); // click toggle
      // Close popup: cursor back to ext icon, click to close
      t(afterDelete + 29200, () => moveCursor('extIcon'));
      t(afterDelete + 30100, () => { setClickKey(k => k + 1); setPopupOpen(false); });
      t(afterDelete + 31000, () => moveCursor('rest')); // cursor drifts to rest

      t(afterDelete + 33000, () => {
        timers.forEach(clearTimeout);
        timers.length = 0;
        clearInterval(typingTimer.current);
        dispatchMascot('typing-stop');
        loop();
      });
    }

    const init = setTimeout(loop, 500);
    return () => {
      clearTimeout(init);
      timers.forEach(clearTimeout);
      clearInterval(typingTimer.current);
      dispatchMascot('typing-stop');
    };
  }, [heroVisible, moveCursor]);

  const tabs: { id: HeroPlatform; label: string; url: string }[] = [
    { id: 'messenger', label: 'Messenger', url: 'messenger.com' },
    { id: 'facebook',  label: 'Facebook',  url: 'facebook.com/messages' },
    { id: 'instagram', label: 'Instagram', url: 'instagram.com/direct' },
  ];

  const PLATFORM_COLORS: Record<HeroPlatform, string> = {
    messenger: '#0082FB', facebook: '#1877F2', instagram: '#E1306C',
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: '100%',
        background: '#141210', borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(240,230,210,0.08)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)',
        pointerEvents: 'none', display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Window chrome */}
      <div style={{ height: 36, background: '#141210', borderBottom: '1px solid rgba(240,230,210,0.06)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#FF5F57' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#FEBC2E' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#28C840' }} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="hero-tabbar" style={{ background: '#141210', display: 'flex', alignItems: 'flex-end', padding: '0 10px', gap: 2, height: 32, borderBottom: '1px solid rgba(240,230,210,0.05)', flexShrink: 0 }}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="hero-tab"
            data-cursor-target={tab.id === 'messenger' ? 'msgTab' : tab.id === 'facebook' ? 'fbTab' : 'igTab'}
            style={{
              height: 27, padding: '0 12px', borderRadius: '6px 6px 0 0',
              background: activePlatform === tab.id ? '#1C1A17' : 'transparent',
              fontFamily: 'var(--g-sans)', fontSize: 11,
              color: activePlatform === tab.id ? 'rgba(240,230,210,0.88)' : 'rgba(240,230,210,0.32)',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.22s ease', whiteSpace: 'nowrap',
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: 4, background: PLATFORM_COLORS[tab.id], opacity: activePlatform === tab.id ? 1 : 0.35, transition: 'opacity 0.22s ease' }} />
            {tab.label}
          </div>
        ))}
        {/* Extension icon */}
        <div className="hero-extension-tab-icon" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingBottom: 3 }}>
          <div data-cursor-target="extIcon" style={{ width: 21, height: 21, borderRadius: 5, background: popupOpen ? 'rgba(196,72,48,0.22)' : 'rgba(196,72,48,0.12)', border: `1px solid ${popupOpen ? 'rgba(196,72,48,0.45)' : 'rgba(196,72,48,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}>
            <GhostMark size={13} />
          </div>
        </div>
      </div>

      {/* Address bar */}
      <div className="hero-address" style={{ background: '#1C1A17', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(240,230,210,0.04)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          <span style={{ color: 'rgba(240,230,210,0.18)', fontSize: 12, lineHeight: '18px', width: 18, textAlign: 'center' }}>‹</span>
          <span style={{ color: 'rgba(240,230,210,0.1)', fontSize: 12, lineHeight: '18px', width: 18, textAlign: 'center' }}>›</span>
        </div>
        <div style={{ flex: 1, height: 24, borderRadius: 12, background: 'rgba(240,230,210,0.05)', border: '1px solid rgba(240,230,210,0.06)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5 }}>
          <Globe size={9} color="rgba(240,230,210,0.25)" />
          <span style={{ fontFamily: 'var(--g-mono)', fontSize: 10, color: 'rgba(240,230,210,0.35)' }}>
            {tabs.find((t) => t.id === activePlatform)?.url}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activePlatform} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} style={{ height: '100%' }}>
            {activePlatform === 'messenger' && (
              <MessengerView activeChatId={activeChatId} typingText={typingText} unreadBadges={unreadBadges} composerFocused={composerFocused} />
            )}
            {activePlatform === 'instagram' && (
              <InstagramView showStory={showStory} igUnreadBadge={igUnreadBadge} activeIgDm={activeIgDm} />
            )}
            {activePlatform === 'facebook' && (
              <FacebookView activeChatId={fbActiveChatId} fbUnreadBadge={fbUnreadBadge} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ghostify popup — positioned at browser container level, just below the tab bar (36px chrome + 32px tabs = 68px) */}
      <GhostifyHeroPopup
        open={popupOpen}
        platform={activePlatform}
        msControls={msControls}
        igControls={igControls}
      />

      {/* Cursor */}
      <DemoCursor x={cursorPos.x} y={cursorPos.y} clickKey={clickKey} target={cursorTarget} />
    </div>
  );
}

/* ── Hero section ─────────────────────────────────────── */
const privacyPixelClassNames = Array.from({ length: 14 }, (_, index) => `hpv-pixel hpv-pixel-${index + 1}`);
const heroSignalWords = ['seen', 'typing', 'story-view'] as const;
type HeroSignalWord = (typeof heroSignalWords)[number];

function HeroSignalText({ routeId, word, begin }: { routeId: string; word: HeroSignalWord; begin: number }) {
  const duration = 6.2;
  const beginAt = `${begin.toFixed(2)}s`;
  const className = `hpv-signal-stage hpv-word-${word.replace(/[^a-z0-9]/g, '-')}`;

  return (
    <text className={className} opacity="0.92">
      <animate
        attributeName="opacity"
        values="0.92;0.92;0.18"
        keyTimes="0;0.96;1"
        dur={`${duration}s`}
        begin={beginAt}
        repeatCount="indefinite"
      />
      <textPath href={`#${routeId}`} startOffset="0%" method="align" spacing="auto">
        <animate
          attributeName="startOffset"
          values="0%;99%"
          dur={`${duration}s`}
          begin={beginAt}
          repeatCount="indefinite"
        />
        {word}
      </textPath>
    </text>
  );
}

function PrivacySignalConsole() {
  const signalRoutes = [
    { id: 'hpv-route-messenger', begin: -0.45 },
    { id: 'hpv-route-instagram', begin: -1.15 },
    { id: 'hpv-route-facebook', begin: -1.85 },
  ];

  return (
    <div className="hpv-scene">
      <div className="hpv-grid" />
      <div className="hpv-pane hpv-pane-left" />
      <div className="hpv-pane hpv-pane-center" />
      <div className="hpv-pane hpv-pane-right" />

      <svg className="hpv-routes" viewBox="0 0 760 620" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hpvMessengerFade" x1="96" y1="176" x2="536" y2="318" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4AA3FF" stopOpacity="0.1" />
            <stop offset="0.6" stopColor="#4AA3FF" stopOpacity="0.36" />
            <stop offset="1" stopColor="#D8A16F" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="hpvInstagramFade" x1="96" y1="318" x2="536" y2="318" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B84CE5" stopOpacity="0.1" />
            <stop offset="0.42" stopColor="#F06A78" stopOpacity="0.34" />
            <stop offset="0.75" stopColor="#F6B45E" stopOpacity="0.42" />
            <stop offset="1" stopColor="#D8A16F" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="hpvFacebookFade" x1="96" y1="462" x2="536" y2="318" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1877F2" stopOpacity="0.1" />
            <stop offset="0.62" stopColor="#1877F2" stopOpacity="0.34" />
            <stop offset="1" stopColor="#D8A16F" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="hpvLaneFade" x1="72" y1="120" x2="384" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F0EBE0" stopOpacity="0.04" />
            <stop offset="0.45" stopColor="#D8A16F" stopOpacity="0.34" />
            <stop offset="1" stopColor="#D8A16F" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="hpvInstagramNode" x1="59" y1="337" x2="99" y2="297" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEDA75" />
            <stop offset="0.34" stopColor="#FA7E1E" />
            <stop offset="0.64" stopColor="#D62976" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
          <clipPath id="hpvSignalBlockClip">
            <rect x="-24" y="-24" width="528" height="668" rx="0" />
          </clipPath>
        </defs>
        <g className="hpv-server-target">
          <path className="hpv-server-link" d="M562 318C580 318 588 318 602 318" />
          <rect className="hpv-server-body" x="600" y="230" width="118" height="188" rx="18" />
          <rect className="hpv-server-bay" x="620" y="256" width="78" height="34" rx="7" />
          <rect className="hpv-server-bay" x="620" y="306" width="78" height="34" rx="7" />
          <rect className="hpv-server-bay" x="620" y="356" width="78" height="34" rx="7" />
          <circle className="hpv-server-port" cx="638" cy="273" r="3" />
          <circle className="hpv-server-port" cx="638" cy="323" r="3" />
          <circle className="hpv-server-port" cx="638" cy="373" r="3" />
          <path className="hpv-server-core" d="M659 273H688M659 323H688M659 373H688" />
        </g>

        <path id="hpv-route-messenger" className="hpv-lane hpv-lane-a" d="M80 176C170 134 268 154 340 226C392 278 466 318 536 318" />
        <path id="hpv-route-instagram" className="hpv-lane hpv-lane-b" d="M80 318H536" />
        <path id="hpv-route-facebook" className="hpv-lane hpv-lane-c" d="M80 462C170 504 268 482 342 410C392 360 466 318 536 318" />

        <g className="hpv-signal-streams" clipPath="url(#hpvSignalBlockClip)">
          {signalRoutes.flatMap((route, routeIndex) =>
            heroSignalWords.map((word, wordIndex) => (
              <HeroSignalText
                key={`${route.id}-${word}`}
                routeId={route.id}
                word={word}
                begin={route.begin - wordIndex * 1.92 - routeIndex * 0.18}
              />
            ))
          )}
        </g>

        <g className="hpv-static-signals" clipPath="url(#hpvSignalBlockClip)" aria-hidden="true">
          <text><textPath href="#hpv-route-messenger" startOffset="16%">seen / typing / story-view</textPath></text>
          <text><textPath href="#hpv-route-instagram" startOffset="16%">seen / typing / story-view</textPath></text>
          <text><textPath href="#hpv-route-facebook" startOffset="16%">seen / typing / story-view</textPath></text>
        </g>

        <g className="hpv-source-nodes">
          <g className="hpv-platform-node hpv-platform-node-messenger">
            <circle className="hpv-source-ring" cx="78" cy="176" r="19" />
            <circle className="hpv-source-face hpv-source-face-messenger" cx="78" cy="176" r="13" />
            <path className="hpv-platform-mark" d="M70.7 179.1 76.6 172.8l4.1 4.2 6.6-6.8-5.8 9.8-4.3-4.3-6.5 3.4Z" />
          </g>
          <g className="hpv-platform-node hpv-platform-node-instagram">
            <circle className="hpv-source-ring" cx="78" cy="318" r="19" />
            <rect className="hpv-source-face hpv-source-face-instagram" x="65" y="305" width="26" height="26" rx="8" />
            <rect className="hpv-platform-camera" x="71.4" y="311.4" width="13.2" height="13.2" rx="4" />
            <circle className="hpv-platform-camera-lens" cx="78" cy="318" r="3.7" />
            <circle className="hpv-platform-camera-dot" cx="83.2" cy="312.8" r="1.35" />
          </g>
          <g className="hpv-platform-node hpv-platform-node-facebook">
            <circle className="hpv-source-ring" cx="78" cy="462" r="19" />
            <circle className="hpv-source-face hpv-source-face-facebook" cx="78" cy="462" r="13" />
            <path className="hpv-platform-mark hpv-platform-mark-facebook" d="M81.1 471v-8.1h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7v-2.9c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H75v3.2h2.8v8.1h3.3Z" />
          </g>
        </g>
      </svg>

      <div className="hpv-mascot-dock" data-hero-mascot-dock aria-hidden />

      <svg className="hpv-ghost" viewBox="0 0 520 620" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="hpvGhostClip">
            <path d="M116 444V220C116 117.3 181.7 52 260 52s144 65.3 144 168v224c0 17.8-20.6 27.7-34.5 16.6l-28.2-22.5-28.3 22.5a25.2 25.2 0 0 1-31.5 0L260 443.5l-21.5 17.1a25.2 25.2 0 0 1-31.5 0l-28.3-22.5-28.2 22.5C136.6 471.7 116 461.8 116 444Z" />
          </clipPath>
          <linearGradient id="hpvGhostFill" x1="141" y1="59" x2="397" y2="475" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5F1E7" stopOpacity="0.64" />
            <stop offset="0.52" stopColor="#D9D6CF" stopOpacity="0.48" />
            <stop offset="1" stopColor="#8F9AA2" stopOpacity="0.14" />
          </linearGradient>
          <pattern id="hpvGhostLines" width="9" height="9" patternUnits="userSpaceOnUse">
            <rect width="3.3" height="9" fill="url(#hpvGhostFill)" />
          </pattern>
        </defs>
        <g clipPath="url(#hpvGhostClip)">
          <rect x="92" y="34" width="336" height="462" fill="url(#hpvGhostLines)" />
          <rect className="hpv-ghost-shade" x="92" y="34" width="336" height="462" fill="url(#hpvGhostFill)" opacity="0.22" />
          <rect className="hpv-ghost-mask" x="92" y="390" width="336" height="120" />
        </g>
        <path className="hpv-ghost-edge" d="M116 444V220C116 117.3 181.7 52 260 52s144 65.3 144 168v224c0 17.8-20.6 27.7-34.5 16.6l-28.2-22.5-28.3 22.5a25.2 25.2 0 0 1-31.5 0L260 443.5l-21.5 17.1a25.2 25.2 0 0 1-31.5 0l-28.3-22.5-28.2 22.5C136.6 471.7 116 461.8 116 444Z" />
        <ellipse className="hpv-eye hpv-eye-left" cx="215" cy="226" rx="28" ry="46" />
        <ellipse className="hpv-eye hpv-eye-right" cx="305" cy="226" rx="28" ry="46" />
      </svg>

      <div className="hpv-pixel-field">
        {privacyPixelClassNames.map((className) => (
          <span key={className} className={className} />
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const proofItems = [
    { title: 'Messenger', detail: 'No seen receipts', kind: 'messenger' as const },
    { title: 'Instagram', detail: 'Hide story views', kind: 'instagram' as const },
    { title: 'Facebook', detail: 'Stay invisible', kind: 'facebook' as const },
    { title: 'Local-only', detail: 'Nothing leaves your browser', kind: 'local' as const },
    { title: 'Open source', detail: 'Read it yourself', kind: 'source' as const },
  ];

  return (
    <section
      id="hero"
      className="snap-start hero-section"
      style={{
        minHeight: 'clamp(700px, 86svh, 860px)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 60,
        background: '#0B0A08',
      }}
    >
      <div aria-hidden className="hero-backdrop" />
      <div aria-hidden className="hero-texture" />
      <div aria-hidden className="hero-vignette" />

      <div
        className="hero-grid"
        style={{
          width: '100%',
          maxWidth: 1480,
          margin: '0 auto',
          padding: 'clamp(42px, 5.8vw, 76px) clamp(24px, 4vw, 72px) clamp(34px, 5vw, 72px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(520px, 0.95fr) minmax(520px, 1.05fr)',
          gap: 'clamp(28px, 4vw, 64px)',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 2, maxWidth: 760 }}
        >
          <div style={{ fontFamily: 'var(--g-mono)', fontSize: 12, letterSpacing: '0.16em', color: 'rgba(196,106,74,0.86)', textTransform: 'uppercase', marginBottom: 24 }}>
            Private by default
          </div>

          <h1 className="hero-title">
            Read messages
            <br />
            <span>without</span>
            <br />
            being seen.
          </h1>

          <p style={{ fontFamily: 'var(--g-sans)', fontSize: 'clamp(1rem, 1.35vw, 1.26rem)', lineHeight: 1.55, color: 'rgba(240,235,224,0.72)', margin: '0 0 30px', maxWidth: 560 }}>
            Ghostify hides seen receipts, typing indicators, and story-view signals on Messenger, Instagram, and Facebook, <span className="hero-local-phrase">all <span className="hero-local-word">locally</span> in your browser.</span>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            <a
              href="https://chromewebstore.google.com/detail/ghostify-hide-seen-typing/flpnibonbhdmnpgflnbemgghghhblmpm?utm_source=item-share-cb"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-primary-cta"
            >
              <Chrome size={16} />
              Add to Chrome
            </a>
            <a
              href="https://github.com/Hendrizzzz/Ghostify"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-secondary-cta"
            >
              <Github size={14} strokeWidth={1.5} />
              View source
            </a>
          </div>

          <div className="hero-proof-row">
            {proofItems.map((item) => (
              <div key={item.title} className="hero-proof-item">
                <div className="hero-proof-icon">
                  <HeroProofIcon kind={item.kind} label={item.title} />
                </div>
                <div>
                  <div className="hero-proof-title">{item.title}</div>
                  <div className="hero-proof-detail">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="hero-privacy-visual"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
            const x = (px - 0.5) * 2;
            const y = (py - 0.5) * 2;
            event.currentTarget.style.setProperty('--hero-pointer-x', x.toFixed(3));
            event.currentTarget.style.setProperty('--hero-pointer-y', y.toFixed(3));
            event.currentTarget.style.setProperty('--hero-hover', '1');
          }}
          onPointerLeave={(event) => {
            event.currentTarget.style.setProperty('--hero-pointer-x', '0');
            event.currentTarget.style.setProperty('--hero-pointer-y', '0');
            event.currentTarget.style.setProperty('--hero-hover', '0');
          }}
          aria-hidden
        >
          <PrivacySignalConsole />
        </motion.div>
      </div>

      <style>{`
        .hero-backdrop {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 23% 49%, rgba(196,106,74,0.075), transparent 24%),
            radial-gradient(ellipse at 74% 45%, rgba(240,235,224,0.045), transparent 34%),
            radial-gradient(ellipse at 76% 70%, rgba(216,161,111,0.035), transparent 32%),
            linear-gradient(90deg, rgba(11,10,8,0.99) 0%, rgba(11,10,8,0.94) 41%, rgba(11,10,8,0.88) 63%, rgba(11,10,8,0.99) 100%);
        }
        .hero-section::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: clamp(96px, 13vh, 150px);
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(11,10,8,0), #0B0A08 78%);
        }
        .hero-texture {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.24;
          background-image:
            repeating-linear-gradient(0deg, rgba(240,235,224,0.03) 0 1px, transparent 1px 5px),
            repeating-linear-gradient(90deg, rgba(240,235,224,0.018) 0 1px, transparent 1px 4px),
            radial-gradient(circle at 30% 12%, rgba(240,235,224,0.05), transparent 20%);
          mix-blend-mode: soft-light;
          -webkit-mask-image: linear-gradient(180deg, black 0%, black 100%);
          mask-image: linear-gradient(180deg, black 0%, black 100%);
        }
        .hero-vignette {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(0,0,0,0.28), transparent 24%, transparent 82%, rgba(0,0,0,0.14) 100%),
            radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%);
        }
        .hero-title {
          font-family: var(--g-display);
          font-size: clamp(3.6rem, 5.45vw, 6.25rem);
          font-weight: 400;
          line-height: 0.94;
          letter-spacing: 0;
          color: var(--g-white);
          margin: 0 0 22px;
          white-space: nowrap;
        }
        .hero-title span { color: #C46A4A; font-style: italic; }
        .hero-local-word {
          font-family: var(--g-display);
          font-style: italic;
          color: #D8A16F;
          font-size: 1.32em;
          line-height: 0.72;
          letter-spacing: 0;
        }
        .hero-local-phrase { white-space: nowrap; }
        .hero-primary-cta,
        .hero-secondary-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 48px;
          padding: 0 28px;
          border-radius: 6px;
          font-family: var(--g-sans);
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          letter-spacing: 0;
          box-sizing: border-box;
          transition: transform 0.16s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
        }
        .hero-primary-cta {
          background: linear-gradient(135deg, #F3EDE2, #D8CBB8);
          color: #0B0A08;
          box-shadow: 0 12px 34px rgba(216,161,111,0.16);
        }
        .hero-secondary-cta {
          color: rgba(240,235,224,0.88);
          border: 1px solid rgba(240,235,224,0.28);
          background: rgba(240,235,224,0.02);
        }
        .hero-primary-cta:hover,
        .hero-secondary-cta:hover { transform: translateY(-1px); }
        .hero-secondary-cta:hover { border-color: rgba(240,235,224,0.42); color: var(--g-white); }
        .hero-proof-row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: clamp(12px, 1vw, 16px);
          width: min(100%, 680px);
          max-width: 100%;
          padding-top: 14px;
          border-top: 1px solid rgba(240,235,224,0.12);
        }
        .hero-proof-item { display: flex; gap: 10px; align-items: start; min-width: 0; }
        .hero-proof-icon {
          width: 28px; height: 28px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(196,106,74,0.14);
          color: #D8A16F;
          font-family: var(--g-sans); font-size: 15px; font-weight: 700;
          border: 1px solid rgba(216,161,111,0.2);
        }
        .hero-proof-title {
          font-family: var(--g-sans); font-size: 13.5px; color: rgba(240,235,224,0.92);
          line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .hero-proof-detail {
          margin-top: 5px;
          font-family: var(--g-sans); font-size: 11.5px; color: rgba(240,235,224,0.42);
          line-height: 1.3; white-space: normal;
        }
        .hero-privacy-visual {
          min-height: min(78svh, 760px);
          position: relative;
          pointer-events: auto;
          perspective: 1500px;
          transform-style: preserve-3d;
          z-index: 1;
          --hero-pointer-x: 0;
          --hero-pointer-y: 0;
          --hero-hover: 0;
        }

        .hpv-scene {
          position: absolute;
          inset: -7% -9% -10% -3%;
          overflow: visible;
          pointer-events: none;
          transform-style: preserve-3d;
          isolation: isolate;
        }
        .hpv-grid {
          position: absolute;
          inset: 8% 2% 9% 4%;
          opacity: 0.105;
          background-image:
            linear-gradient(90deg, rgba(240,235,224,0.14) 1px, transparent 1px),
            linear-gradient(0deg, rgba(240,235,224,0.09) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(ellipse at 58% 52%, black 0 50%, transparent 78%);
          transform:
            translate3d(calc(var(--hero-pointer-x, 0) * -6px), calc(var(--hero-pointer-y, 0) * -4px), -170px)
            rotateY(-20deg)
            skewY(-4deg);
          transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hpv-pane {
          position: absolute;
          border: 1px solid rgba(221,229,232,0.16);
          background:
            linear-gradient(116deg, rgba(170,184,193,0.13), rgba(170,184,193,0.038) 42%, rgba(240,235,224,0.045)),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 44px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 42px);
          box-shadow:
            inset 0 0 1px rgba(255,255,255,0.28),
            0 28px 70px rgba(0,0,0,0.36);
          opacity: 0.5;
          transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms ease;
        }
        .hpv-pane::after {
          content: "";
          position: absolute;
          inset: 0;
          border-left: 1px solid rgba(255,255,255,0.10);
          opacity: 0.38;
        }
        .hpv-pane-left {
          width: 36%;
          height: 52%;
          left: 6%;
          top: 28%;
          clip-path: polygon(0 28%, 100% 0, 100% 100%, 0 84%);
          transform:
            translate3d(calc(var(--hero-pointer-x, 0) * -15px), calc(var(--hero-pointer-y, 0) * -7px), -48px)
            rotateY(-25deg)
            skewY(-6deg);
        }
        .hpv-pane-center {
          width: 31%;
          height: 74%;
          left: 35%;
          top: 5%;
          opacity: 0.42;
          clip-path: polygon(0 0, 100% 9%, 100% 100%, 0 90%);
          transform:
            translate3d(calc(var(--hero-pointer-x, 0) * -6px), calc(var(--hero-pointer-y, 0) * -11px), -92px)
            rotateY(-14deg)
            skewY(-4deg);
        }
        .hpv-pane-right {
          width: 43%;
          height: 58%;
          right: 5%;
          top: 22%;
          opacity: 0.38;
          clip-path: polygon(0 10%, 100% 30%, 100% 92%, 0 100%);
          transform:
            translate3d(calc(var(--hero-pointer-x, 0) * 13px), calc(var(--hero-pointer-y, 0) * -6px), -30px)
            rotateY(-16deg)
            skewY(4deg);
        }
        .hpv-routes {
          position: absolute;
          inset: 1% 3% 5% 1%;
          width: 100%;
          height: 100%;
          overflow: visible;
          transform:
            translate3d(calc(var(--hero-pointer-x, 0) * -9px), calc(var(--hero-pointer-y, 0) * -4px), 38px)
            rotateY(-6deg);
          transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 5;
        }
        .hpv-lane {
          fill: none;
          stroke: var(--hpv-lane-stroke, url(#hpvLaneFade));
          stroke-width: 1.45;
          stroke-linecap: round;
          opacity: 0.5;
        }
        .hpv-lane-a { --hpv-lane-stroke: url(#hpvMessengerFade); --hpv-pulse-stroke: #74B7FF; }
        .hpv-lane-b { --hpv-lane-stroke: url(#hpvInstagramFade); --hpv-pulse-stroke: #F3A463; opacity: 0.42; }
        .hpv-lane-c { --hpv-lane-stroke: url(#hpvFacebookFade); --hpv-pulse-stroke: #5A9BFF; }
        .hpv-signal-streams,
        .hpv-static-signals {
          pointer-events: none;
        }
        .hpv-signal-stage,
        .hpv-static-signals text {
          font-family: var(--g-mono);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.035em;
          fill: color-mix(in srgb, var(--hpv-signal-color, #D8A16F) 76%, #F0EBE0);
          text-anchor: middle;
          paint-order: stroke;
          stroke: rgba(11,10,8,0.9);
          stroke-width: 3.5px;
          stroke-linejoin: round;
          dominant-baseline: middle;
        }
        .hpv-signal-stage {
          filter: drop-shadow(0 0 5px color-mix(in srgb, var(--hpv-signal-color, #D8A16F) 36%, transparent));
        }
        .hpv-word-seen { --hpv-signal-color: #74B7FF; }
        .hpv-word-typing { --hpv-signal-color: #E8A15D; }
        .hpv-word-story-view { --hpv-signal-color: #EF6F87; }
        .hpv-static-signals {
          display: none;
          opacity: 0.62;
        }
        .hpv-server-target {
          opacity: 0.54;
          transform:
            translate3d(calc(var(--hero-pointer-x, 0) * 7px), calc(var(--hero-pointer-y, 0) * -3px), -14px);
          transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms ease;
        }
        .hpv-server-link {
          fill: none;
          stroke: rgba(216,161,111,0.4);
          stroke-width: 1.25;
          stroke-linecap: round;
          stroke-dasharray: 7 11;
          opacity: 0.68;
        }
        .hpv-server-body {
          fill: rgba(14,15,14,0.72);
          stroke: rgba(240,235,224,0.22);
          stroke-width: 1.2;
        }
        .hpv-server-bay {
          fill: rgba(240,235,224,0.055);
          stroke: rgba(240,235,224,0.16);
          stroke-width: 1;
        }
        .hpv-server-port {
          fill: rgba(216,161,111,0.72);
        }
        .hpv-server-core {
          stroke: rgba(240,235,224,0.24);
          stroke-width: 1.2;
          stroke-linecap: round;
        }
        .hpv-mascot-dock {
          position: absolute;
          left: 66.4%;
          top: 51.35%;
          width: 74px;
          height: 74px;
          border-radius: 50%;
          z-index: 6;
          pointer-events: none;
          transform:
            translate3d(calc(-50% + var(--hero-pointer-x, 0) * 9px), calc(-50% + var(--hero-pointer-y, 0) * -3px), 96px);
          background:
            radial-gradient(circle at 50% 50%, rgba(216,161,111,0.18), rgba(216,161,111,0.045) 48%, transparent 70%);
          border: 1px solid rgba(216,161,111,0.26);
          box-shadow:
            inset 0 0 0 1px rgba(240,235,224,0.05),
            0 0 0 1px rgba(11,10,8,0.5),
            0 16px 34px rgba(0,0,0,0.28);
          opacity: 0.66;
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms ease;
        }
        .hpv-mascot-dock::after {
          content: "";
          position: absolute;
          inset: 16px;
          border-radius: 50%;
          border: 1px solid rgba(240,235,224,0.18);
          background: rgba(11,10,8,0.28);
        }
        .hpv-platform-node {
          animation: hpvNodeBreathe 4.9s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .hpv-platform-node-instagram { animation-delay: -1.6s; }
        .hpv-platform-node-facebook { animation-delay: -3.2s; }
        .hpv-source-ring {
          fill: rgba(11,10,8,0.7);
          stroke: rgba(240,235,224,0.18);
          stroke-width: 1;
        }
        .hpv-source-face {
          stroke: rgba(255,255,255,0.2);
          stroke-width: 1;
        }
        .hpv-source-face-messenger { fill: #0A7CFF; }
        .hpv-source-face-instagram {
          fill: url(#hpvInstagramNode);
          stroke: rgba(255,255,255,0.22);
        }
        .hpv-source-face-facebook { fill: #1877F2; }
        .hpv-platform-mark {
          fill: #fff;
        }
        .hpv-platform-mark-facebook {
          fill: #fff;
        }
        .hpv-platform-camera,
        .hpv-platform-camera-lens {
          fill: none;
          stroke: #fff;
          stroke-width: 1.9;
        }
        .hpv-platform-camera-dot {
          fill: #fff;
        }
        .hpv-ghost {
          position: absolute;
          width: min(39vw, 560px);
          max-width: 82%;
          right: 11%;
          top: 49%;
          overflow: visible;
          z-index: 4;
          opacity: 0.78;
          transform:
            translate3d(calc(var(--hero-pointer-x, 0) * 14px), calc(-50% + var(--hero-pointer-y, 0) * 9px), 84px)
            rotateX(calc(var(--hero-pointer-y, 0) * -1.6deg))
            rotateY(calc(var(--hero-pointer-x, 0) * 3.6deg))
            rotateZ(-1.2deg);
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms ease;
        }
        .hpv-ghost-edge {
          stroke: rgba(255,255,255,0.2);
          stroke-width: 1.1;
          fill: transparent;
        }
        .hpv-ghost-mask {
          fill: rgba(11,10,8,0.56);
        }
        .hpv-eye {
          fill: rgba(13,18,22,0.86);
        }
        .hpv-pixel-field {
          position: absolute;
          left: 24%;
          right: 12%;
          bottom: 7%;
          height: 28%;
          z-index: 3;
          opacity: 0.22;
          transform:
            translate3d(calc(var(--hero-pointer-x, 0) * 8px), calc(var(--hero-pointer-y, 0) * 6px), 52px)
            rotateY(-11deg)
            skewY(-4deg);
          transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hpv-pixel {
          position: absolute;
          width: var(--px-w, 14px);
          height: var(--px-h, 28px);
          left: var(--px-x);
          bottom: var(--px-y);
          background: rgba(155,166,170,0.14);
          border: 1px solid rgba(240,235,224,0.055);
          animation: hpvPixelDrift var(--px-dur, 8s) ease-in-out infinite;
          animation-delay: var(--px-delay, 0s);
        }
        .hpv-pixel-1 { --px-x: 4%; --px-y: 8%; --px-w: 10px; --px-h: 18px; --px-dur: 7.2s; }
        .hpv-pixel-2 { --px-x: 13%; --px-y: 33%; --px-w: 14px; --px-h: 38px; --px-delay: -1s; }
        .hpv-pixel-3 { --px-x: 21%; --px-y: 5%; --px-w: 7px; --px-h: 58px; --px-delay: -2.3s; }
        .hpv-pixel-4 { --px-x: 31%; --px-y: 25%; --px-w: 19px; --px-h: 27px; --px-delay: -4.2s; }
        .hpv-pixel-5 { --px-x: 39%; --px-y: 11%; --px-w: 6px; --px-h: 68px; --px-delay: -1.8s; }
        .hpv-pixel-6 { --px-x: 48%; --px-y: 40%; --px-w: 18px; --px-h: 18px; --px-delay: -5.1s; }
        .hpv-pixel-7 { --px-x: 57%; --px-y: 18%; --px-w: 11px; --px-h: 42px; --px-delay: -0.8s; }
        .hpv-pixel-8 { --px-x: 66%; --px-y: 3%; --px-w: 22px; --px-h: 23px; --px-delay: -3.4s; }
        .hpv-pixel-9 { --px-x: 74%; --px-y: 38%; --px-w: 8px; --px-h: 52px; --px-delay: -6s; }
        .hpv-pixel-10 { --px-x: 82%; --px-y: 17%; --px-w: 17px; --px-h: 28px; --px-delay: -2s; }
        .hpv-pixel-11 { --px-x: 89%; --px-y: 6%; --px-w: 10px; --px-h: 64px; --px-delay: -4.8s; }
        .hpv-pixel-12 { --px-x: 18%; --px-y: 58%; --px-w: 22px; --px-h: 16px; --px-delay: -1.2s; }
        .hpv-pixel-13 { --px-x: 52%; --px-y: 61%; --px-w: 18px; --px-h: 15px; --px-delay: -3.8s; }
        .hpv-pixel-14 { --px-x: 84%; --px-y: 57%; --px-w: 20px; --px-h: 16px; --px-delay: -5.6s; }

        @keyframes hpvNodeBreathe {
          0%, 100% { opacity: 0.44; }
          18%, 56% { opacity: 0.88; }
        }
        @keyframes hpvPixelDrift {
          0%, 100% { transform: translateY(0); opacity: 0.22; }
          52% { transform: translateY(-11px); opacity: 0.42; }
        }

        @keyframes ghostBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.1); }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .hpv-platform-node,
          .hpv-pixel {
            animation: none !important;
          }
          .hpv-signal-streams {
            display: none;
          }
          .hpv-static-signals {
            display: block;
          }
          .hpv-grid,
          .hpv-pane,
          .hpv-routes,
          .hpv-mascot-dock,
          .hpv-server-target,
          .hpv-ghost,
          .hpv-pixel-field {
            transition: none !important;
          }
        }

        /* Breakpoints */
        @media (max-width: 1180px) {
          .hero-grid {
            grid-template-columns: minmax(390px, 0.82fr) minmax(470px, 1.18fr) !important;
            gap: 18px !important;
            padding-left: 32px !important;
            padding-right: 32px !important;
          }
          .hero-title { font-size: clamp(3.45rem, 5.65vw, 5.45rem); }
          .hero-proof-row { grid-template-columns: repeat(3, minmax(0, 1fr)); width: min(100%, 440px); max-width: calc(100vw - 64px); gap: 12px 14px; }
          .hero-proof-item { min-width: 0; }
          .hero-proof-detail { white-space: normal; }
          .hero-proof-icon { width: 26px; height: 26px; }
          .hero-proof-title { font-size: 13px; }
          .hero-proof-detail { font-size: 11px; }
          .hpv-scene { inset: -6% -12% -10% -4%; }
          .hpv-ghost { width: min(43vw, 520px); right: 8%; }
        }
        @media (max-width: 900px) {
          .hero-section {
            min-height: 100svh !important;
            align-items: flex-start !important;
            padding-top: 82px !important;
            padding-bottom: 48px !important;
          }
          .hero-grid {
            grid-template-columns: minmax(365px, 0.78fr) minmax(420px, 1.22fr) !important;
            max-width: none !important;
            box-sizing: border-box !important;
            padding: 0 32px !important;
            gap: 8px !important;
            align-items: center !important;
          }
          .hero-grid > * { min-width: 0 !important; }
          .hero-title { font-size: clamp(3.25rem, 7.4vw, 4.7rem); }
          .hero-proof-row { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 12px; max-width: min(100%, 430px); overflow: hidden; }
          .hero-privacy-visual { min-height: clamp(420px, 58vw, 560px); width: 100%; max-width: none; justify-self: center; }
          .hpv-scene { inset: -5% -16% -8% -8%; }
          .hpv-ghost { width: min(52vw, 500px); right: 5%; }
        }
        @media (max-width: 820px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            max-width: min(620px, calc(100vw - 48px)) !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding: 0 24px !important;
            gap: 20px !important;
            overflow: visible;
          }
          .hero-grid p { max-width: 460px !important; font-size: 1rem !important; line-height: 1.5 !important; }
          .hero-title { font-size: clamp(3.35rem, 9.2vw, 4.35rem); }
          .hero-proof-row { grid-template-columns: repeat(2, minmax(0, max-content)) !important; width: 100% !important; max-width: 470px !important; }
          .hero-proof-item { min-width: 0; }
          .hero-primary-cta, .hero-secondary-cta { width: 100%; }
          .hero-privacy-visual {
            position: absolute;
            inset: 86px -220px auto auto;
            width: 560px;
            height: 520px;
            min-height: 0;
            max-width: none;
            justify-self: auto;
            opacity: 0.18;
            pointer-events: none;
            perspective: none;
            -webkit-mask-image: linear-gradient(90deg, transparent 0 24%, rgba(0,0,0,0.35) 42%, black 68%);
            mask-image: linear-gradient(90deg, transparent 0 24%, rgba(0,0,0,0.35) 42%, black 68%);
          }
          .hpv-scene { inset: 0; transform-style: flat; }
          .hpv-mascot-dock,
          .hpv-grid,
          .hpv-routes { display: none; }
          .hpv-pane-left,
          .hpv-pane-right { display: none; }
          .hpv-pane-center { width: 66%; height: 64%; left: 28%; top: 14%; transform: rotateY(-12deg) skewY(-4deg); opacity: 0.2; }
          .hpv-ghost { width: 410px; right: 0; top: 15%; transform: translate3d(0, 0, 0) rotateZ(-1.2deg); opacity: 0.64; }
          .hpv-pixel-field { left: 24%; right: 8%; bottom: 5%; height: 25%; opacity: 0.16; }
        }
        @media (max-width: 480px) {
          .hero-grid { max-width: min(354px, calc(100vw - 36px)) !important; padding: 0 18px !important; margin-left: 0 !important; margin-right: auto !important; }
          .hero-title { font-size: clamp(2.42rem, 11.8vw, 3.25rem); }
          .hero-proof-row { grid-template-columns: 1fr !important; max-width: 100% !important; }
          .hero-primary-cta, .hero-secondary-cta { width: 100%; }
          .hero-privacy-visual {
            inset: 156px -300px auto auto;
            width: 560px;
            height: 470px;
            opacity: 0.16;
            -webkit-mask-image: linear-gradient(90deg, transparent 0 30%, rgba(0,0,0,0.2) 47%, black 74%);
            mask-image: linear-gradient(90deg, transparent 0 30%, rgba(0,0,0,0.2) 47%, black 74%);
          }
          .hpv-ghost { width: 390px; right: 0; top: 16%; }
          .hpv-pane-center { left: 34%; top: 14%; width: 60%; opacity: 0.16; }
        }
        @media (max-width: 400px) {
          .hero-title { font-size: clamp(2.34rem, 11.6vw, 3rem); }
          .hero-grid p { max-width: 306px !important; }
          .hero-privacy-visual { inset: 168px -318px auto auto; opacity: 0.145; }
          .hpv-ghost { width: 382px; }
        }

      `}</style>
    </section>
  );
}

function LegacyHeroSection() {
  return (
    <section
      id="hero"
      className="snap-start hero-section"
      style={{ height: '100svh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 60, background: '#0B0A08' }}
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(11,10,8,0.96) 0%, rgba(11,10,8,0.9) 36%, rgba(11,10,8,0.72) 68%, rgba(11,10,8,0.94) 100%)', zIndex: 0, pointerEvents: 'none' }} />
      <div aria-hidden className="hero-grain" />

      <div
        className="hero-grid"
        style={{
          width: '100%', maxWidth: 1440, margin: '0 auto',
          padding: '0 clamp(24px, 4vw, 72px)',
          display: 'grid', gridTemplateColumns: 'minmax(360px, 0.82fr) minmax(0, 1.18fr)',
          gap: 'clamp(28px, 3vw, 48px)',
          alignItems: 'center', position: 'relative', zIndex: 1,
        }}
      >
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 2, maxWidth: 480 }}
        >
          <h1 style={{ fontFamily: 'var(--g-display)', fontSize: 'clamp(2.8rem, 4.4vw, 4.4rem)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.06, letterSpacing: 0, color: 'var(--g-white)', margin: '0 0 8px' }}>
            Read it.
          </h1>
          <h1 style={{ fontFamily: 'var(--g-display)', fontSize: 'clamp(2.8rem, 4.4vw, 4.4rem)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.06, letterSpacing: 0, color: 'rgba(240,235,224,0.45)', margin: '0 0 28px' }}>
            Don't announce it.
          </h1>

          <p style={{ fontFamily: 'var(--g-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--g-body)', margin: '0 0 10px', maxWidth: 400 }}>
            Ghostify locally hides read receipts, typing indicators, and supported story-view signals on Messenger, Facebook, and Instagram.
          </p>
          <p style={{ fontFamily: 'var(--g-sans)', fontSize: 15, lineHeight: 1.65, color: 'rgba(240,235,224,0.3)', margin: '0 0 32px', maxWidth: 400 }}>
            No account login. No cloud relay. Just your browser quietly refusing to snitch.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <a
              href="https://chromewebstore.google.com/detail/ghostify-hide-seen-typing/flpnibonbhdmnpgflnbemgghghhblmpm?utm_source=item-share-cb"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 7, background: 'var(--g-white)', color: '#0B0A08', fontFamily: 'var(--g-sans)', fontSize: 15, fontWeight: 500, textDecoration: 'none', letterSpacing: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.28)', transition: 'opacity 0.18s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <Chrome size={14} />
              Get Ghostify
            </a>
            <a
              href="https://github.com/Hendrizzzz/Ghostify"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 7, background: 'transparent', color: 'var(--g-white-dim)', fontFamily: 'var(--g-sans)', fontSize: 15, fontWeight: 400, textDecoration: 'none', letterSpacing: 0, border: '1px solid rgba(240,230,210,0.13)', transition: 'border-color 0.18s ease, color 0.18s ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,230,210,0.28)'; (e.currentTarget as HTMLElement).style.color = 'var(--g-white)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,230,210,0.13)'; (e.currentTarget as HTMLElement).style.color = 'var(--g-white-dim)'; }}
            >
              <Github size={14} strokeWidth={1.5} />
              View source
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {['Open source', 'Runs locally', 'No account credentials', 'Browser extension'].map((item, i) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'var(--g-mono)', fontSize: 10, color: 'var(--g-dim)', letterSpacing: '0.02em' }}>{item}</span>
                {i < 3 && <span style={{ color: 'rgba(240,230,210,0.15)', fontSize: 10 }}>·</span>}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right: laptop product visual */}
        <motion.div
          className="hero-laptop-visual"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.78, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 'min(calc(100svh - 96px), 640px)', minHeight: 460, position: 'relative', pointerEvents: 'none' }}
        >
          <div aria-hidden className="hero-laptop-shadow" />
          <div
            aria-hidden
            className="hero-laptop-haze"
            style={{
              position: 'absolute',
              width: 'min(58vw, 900px)',
              height: 'min(42vw, 620px)',
              right: 'clamp(-94px, -6vw, -36px)',
              bottom: 'clamp(-72px, -4vw, -30px)',
              background: 'linear-gradient(135deg, rgba(240,235,224,0.13), rgba(240,235,224,0.02) 38%, transparent 72%)',
              filter: 'blur(22px)',
              opacity: 0.34,
            }}
          />
          <picture
            className="hero-laptop-picture"
            style={{
              position: 'absolute',
              width: 'clamp(520px, 55vw, 900px)',
              maxWidth: 'none',
              right: 'clamp(-86px, -5.4vw, -32px)',
              bottom: 'clamp(-98px, -5.8vw, -42px)',
              filter: 'brightness(1.24) contrast(1.08) saturate(1.04)',
              userSelect: 'none',
            }}
          >
            <source media="(max-width: 900px)" srcSet="/hero-laptop-scene-tight.webp" />
            <img
              src="/hero-laptop-scene.webp"
              alt="Ghostify privacy controls shown in a laptop browser."
              className="hero-laptop-image"
              draggable={false}
            />
          </picture>
        </motion.div>
      </div>

      <style>{`
        .hero-grain {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            repeating-linear-gradient(0deg, rgba(240,235,224,0.025) 0 1px, transparent 1px 3px),
            repeating-linear-gradient(90deg, rgba(240,235,224,0.018) 0 1px, transparent 1px 4px);
          mix-blend-mode: soft-light;
        }
        .hero-laptop-visual {
          mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 96%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 96%, transparent 100%);
        }
        .hero-laptop-picture {
          display: block;
          line-height: 0;
          mask-image: radial-gradient(ellipse at 57% 57%, #000 0 66%, rgba(0,0,0,0.96) 80%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse at 57% 57%, #000 0 66%, rgba(0,0,0,0.96) 80%, transparent 100%);
        }
        .hero-laptop-image {
          display: block;
          width: 100%;
          height: auto;
        }
        .hero-laptop-shadow {
          position: absolute;
          width: min(54vw, 860px);
          height: min(18vw, 230px);
          right: clamp(-80px, -5vw, -28px);
          bottom: clamp(-30px, -2vw, -12px);
          background: radial-gradient(closest-side, rgba(0,0,0,0.66), transparent 72%);
          filter: blur(14px);
          opacity: 0.78;
        }
        @media (max-width: 1100px) and (min-width: 901px) {
          .hero-grid {
            grid-template-columns: minmax(320px, 0.9fr) minmax(470px, 1.1fr) !important;
            gap: 28px !important;
            padding: 0 32px !important;
          }
          .hero-laptop-visual {
            min-height: 430px !important;
            height: min(calc(100svh - 104px), 560px) !important;
          }
          .hero-laptop-picture {
            width: clamp(560px, 58vw, 660px) !important;
            right: clamp(-92px, -7vw, -54px) !important;
            bottom: clamp(-76px, -7vh, -42px) !important;
          }
        }
        @media (max-width: 900px) {
          .hero-section {
            height: auto !important;
            min-height: 100svh !important;
            align-items: flex-start !important;
            overflow: visible !important;
            padding-top: 82px !important;
            padding-bottom: 48px !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            max-width: 780px !important;
            box-sizing: border-box !important;
            padding: 0 24px !important;
            gap: 28px !important;
            align-items: start !important;
          }
          .hero-grid > * {
            min-width: 0 !important;
          }
          .hero-laptop-visual {
            width: 100% !important;
            max-width: 760px !important;
            min-height: 330px !important;
            height: min(44svh, 380px) !important;
            justify-self: center !important;
            overflow: hidden !important;
            mask-image: linear-gradient(180deg, #000 0 88%, transparent 100%) !important;
            -webkit-mask-image: linear-gradient(180deg, #000 0 88%, transparent 100%) !important;
          }
          .hero-laptop-visual > div {
            width: 100% !important;
            height: 70% !important;
            right: 0 !important;
            bottom: 0 !important;
            filter: blur(20px) !important;
            opacity: 0.34 !important;
          }
          .hero-laptop-picture {
            width: min(96vw, 640px) !important;
            left: 50% !important;
            right: auto !important;
            bottom: -4% !important;
            transform: translateX(-50%) !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
          }
        }
        @media (max-width: 768px) {
          .hero-section {
            height: auto !important;
            min-height: 100svh !important;
            align-items: flex-start !important;
            overflow: visible !important;
            padding-top: 76px !important;
            padding-bottom: 44px !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            box-sizing: border-box !important;
            padding: 0 18px !important;
            gap: 24px !important;
            align-items: start !important;
          }
          .hero-grid > * {
            min-width: 0 !important;
          }
          .hero-glow {
            display: none !important;
          }
          .hero-laptop-visual {
            width: 100% !important;
            max-width: 640px !important;
            min-height: 270px !important;
            height: min(42svh, 340px) !important;
            justify-self: center !important;
            overflow: hidden !important;
          }
          .hero-laptop-visual > div {
            width: 100% !important;
            height: 72% !important;
            right: 0 !important;
            bottom: 0 !important;
            filter: blur(18px) !important;
            opacity: 0.34 !important;
          }
          .hero-laptop-visual img {
            width: min(116vw, 680px) !important;
            right: 50% !important;
            bottom: -16% !important;
            transform: translateX(50%) !important;
          }
          .hero-tabbar {
            padding-left: 8px !important;
            padding-right: 8px !important;
            gap: 1px !important;
            overflow: hidden !important;
          }
          .hero-tab {
            padding-left: 8px !important;
            padding-right: 8px !important;
            min-width: 0 !important;
            flex: 0 1 auto !important;
            font-size: 10.5px !important;
            gap: 4px !important;
          }
          .hero-extension-tab-icon {
            padding-left: 4px !important;
          }
          .hero-address {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          .hero-chat-list {
            width: clamp(112px, 34%, 156px) !important;
            flex-basis: clamp(112px, 34%, 156px) !important;
          }
          .hero-thread {
            min-width: 0 !important;
            flex: 1 1 auto !important;
          }
        }
        @media (max-width: 420px) {
          .hero-laptop-visual {
            height: clamp(220px, 34svh, 280px) !important;
            min-height: 220px !important;
          }
          .hero-laptop-picture {
            width: min(108vw, 430px) !important;
            bottom: 0 !important;
          }
          .hero-chat-list {
            width: clamp(108px, 35%, 126px) !important;
            flex-basis: clamp(108px, 35%, 126px) !important;
          }
          .hero-tab {
            padding-left: 6px !important;
            padding-right: 6px !important;
            font-size: 9.5px !important;
          }
          .hero-extension-tab-icon {
            padding-left: 3px !important;
          }
        }
        @media (max-width: 340px) {
          .hero-tab {
            padding-left: 4px !important;
            padding-right: 4px !important;
            font-size: 9px !important;
            gap: 3px !important;
          }
          .hero-address > div:first-child {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
