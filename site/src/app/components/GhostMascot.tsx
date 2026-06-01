import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GhostSVG } from './GhostSVG';

const EVENT_PHRASES: Record<string, string> = {
  typing: 'typing stayed quiet.',
  'chat-open': 'seen stayed back.',
  'story-view': 'story stayed quiet.',
  'feature-off': 'that one went through.',
};

const FRICTION  = 0.88;
const GRAVITY   = 0.25;
const BOUNCE    = 0.26;
const MIN_SPEED = 0.35;
const GHOST_W   = 64;
const GHOST_H   = 64;
const GLIDE_K   = 0.045;
const BUBBLE_W  = 200;
const IDLE_MESSAGE_MS = 5200;
const IDLE_PROMPT_MS  = 14000;
const IDLE_PHRASES = [
  'No login. No cloud relay.',
  'Read receipts stay local.',
  'Typing indicators stay quiet.',
  'Messenger, Facebook, Instagram.',
  "move me. i'll settle.",
];

export function GhostMascot() {
  const [displayPos, setDisplayPos]   = useState({ x: -200, y: -200 });
  const [message, setMessage]         = useState<string | null>(null);
  const [isFlying, setIsFlying]       = useState(false);
  const [isDancing, setIsDancing]     = useState(false);
  const [bubbleBelow, setBubbleBelow] = useState(false);
  const [bubbleLeft, setBubbleLeft]   = useState<number>(0);
  const [mounted, setMounted]         = useState(false);

  const pos           = useRef({ x: 200, y: 200 });
  const vel           = useRef({ x: 0, y: 0 });
  const isDragging    = useRef(false);
  const dragOffset    = useRef({ x: 0, y: 0 });
  const lastPointers  = useRef<{ x: number; y: number; t: number }[]>([]);
  const rafRef        = useRef<number>();
  const msgTimer      = useRef<ReturnType<typeof setTimeout>>();
  const idleTimer     = useRef<ReturnType<typeof setInterval>>();
  const idlePhase     = useRef(Math.random() * Math.PI * 2);
  const idleT         = useRef(0);
  const idlePhrase    = useRef(0);
  const lastTouched   = useRef(Date.now());
  const ghostRef      = useRef<HTMLDivElement>(null);

  // Hold-center state
  const isHoldingCenter  = useRef(false);
  const holdCenterUntil  = useRef(0);
  const centerTarget     = useRef({ x: 0, y: 0 });

  const updateBubblePos = useCallback((px: number, py: number) => {
    const vw = window.innerWidth;
    const margin = 14;
    let left = px + GHOST_W / 2 - BUBBLE_W / 2;
    left = Math.max(margin, Math.min(vw - BUBBLE_W - margin, left));
    setBubbleLeft(left);
    setBubbleBelow(py < 110);
  }, []);

  const showMessage = useCallback((msg: string, duration = IDLE_MESSAGE_MS) => {
    clearTimeout(msgTimer.current);
    setMessage(msg);
    msgTimer.current = setTimeout(() => setMessage(null), duration);
  }, []);

  const heroIsVisible = useCallback(() => {
    const hero = document.getElementById('hero');
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.2;
  }, []);

  const glideToCenter = useCallback(() => {
    const cx = window.innerWidth / 2 - GHOST_W / 2;
    const cy = Math.max(80, window.innerHeight * 0.38 - GHOST_H / 2);
    centerTarget.current  = { x: cx, y: cy };
    isHoldingCenter.current = true;
    holdCenterUntil.current = Date.now() + 5800;
  }, []);

  const extendHoldCenter = useCallback((ms = 5500) => {
    if (isHoldingCenter.current) {
      holdCenterUntil.current = Math.max(holdCenterUntil.current, Date.now() + ms);
    }
  }, []);

  // RAF physics + hold-center glide
  const tick = useCallback(() => {
    if (!isDragging.current) {
      if (isHoldingCenter.current) {
        if (Date.now() < holdCenterUntil.current) {
          const cx = centerTarget.current.x;
          const cy = centerTarget.current.y;
          const dx = cx - pos.current.x;
          const dy = cy - pos.current.y;
          if (Math.sqrt(dx * dx + dy * dy) > 1.5) {
            pos.current.x += dx * GLIDE_K;
            pos.current.y += dy * GLIDE_K;
          } else {
            pos.current.x = cx;
            pos.current.y = cy;
          }
          vel.current = { x: 0, y: 0 };
          setDisplayPos({ x: pos.current.x, y: pos.current.y });
          updateBubblePos(pos.current.x, pos.current.y);
          setIsFlying(false);
        } else {
          isHoldingCenter.current = false;
        }
      } else {
        const vx = vel.current.x;
        const vy = vel.current.y;
        const speed = Math.sqrt(vx * vx + vy * vy);

        if (speed > MIN_SPEED) {
          vel.current.x *= FRICTION;
          vel.current.y  = vel.current.y * FRICTION + GRAVITY;

          const vw = window.innerWidth  - GHOST_W;
          const vh = window.innerHeight - GHOST_H;

          pos.current.x += vel.current.x;
          pos.current.y += vel.current.y;

          if (pos.current.x <= 0)  { pos.current.x = 0;  vel.current.x *= -BOUNCE; }
          if (pos.current.x >= vw) { pos.current.x = vw; vel.current.x *= -BOUNCE; }
          if (pos.current.y <= 0)  { pos.current.y = 0;  vel.current.y *= -BOUNCE; }
          if (pos.current.y >= vh) {
            pos.current.y   = vh;
            vel.current.y  *= -BOUNCE;
            vel.current.x  *= 0.72;
          }

          setDisplayPos({ x: pos.current.x, y: pos.current.y });
          updateBubblePos(pos.current.x, pos.current.y);
          setIsFlying(true);
        } else {
          // Idle drift — very slow
          idleT.current += 0.007;
          const dx = Math.sin(idleT.current * 0.22 + idlePhase.current) * 0.08;
          const dy = Math.cos(idleT.current * 0.16 + idlePhase.current + 1) * 0.05;
          pos.current.x = Math.max(0, Math.min(window.innerWidth  - GHOST_W, pos.current.x + dx));
          pos.current.y = Math.max(0, Math.min(window.innerHeight - GHOST_H, pos.current.y + dy));
          vel.current = { x: 0, y: 0 };
          setDisplayPos({ x: pos.current.x, y: pos.current.y });
          updateBubblePos(pos.current.x, pos.current.y);
          setIsFlying(false);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [updateBubblePos]);

  useEffect(() => {
    setMounted(true);
    pos.current = { x: window.innerWidth * 0.78, y: window.innerHeight * 0.22 };
    setDisplayPos({ x: pos.current.x, y: pos.current.y });
    updateBubblePos(pos.current.x, pos.current.y);

    rafRef.current = requestAnimationFrame(tick);

    // No idle phrase cycle — mascot is silent unless triggered by events

    return () => {
      clearTimeout(msgTimer.current);
      clearInterval(idleTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick, showMessage, updateBubblePos]);

  useEffect(() => {
    idleTimer.current = setInterval(() => {
      if (isDragging.current || isHoldingCenter.current || heroIsVisible()) return;
      if (Date.now() - lastTouched.current < IDLE_PROMPT_MS) return;

      const phrase = IDLE_PHRASES[idlePhrase.current % IDLE_PHRASES.length];
      idlePhrase.current += 1;
      lastTouched.current = Date.now();
      showMessage(phrase, IDLE_MESSAGE_MS);
    }, 3000);

    return () => clearInterval(idleTimer.current);
  }, [heroIsVisible, showMessage]);

  // React to hero browser events
  useEffect(() => {
    const handler = (e: Event) => {
      const type = (e as CustomEvent<{ type: string }>).detail?.type;
      if (!type) return;
      const phrase = EVENT_PHRASES[type];
      if (!phrase) return;

      if (type === 'typing') {
        extendHoldCenter(5500);
        setIsDancing(true);
        setTimeout(() => setIsDancing(false), 1400);
      } else if (type === 'chat-open' || type === 'story-view') {
        glideToCenter();
      }

      showMessage(phrase, 4000);
    };

    window.addEventListener('ghostify:mascot', handler);
    return () => window.removeEventListener('ghostify:mascot', handler);
  }, [showMessage, glideToCenter, extendHoldCenter]);

  // Pointer drag
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    lastTouched.current = Date.now();
    isDragging.current = true;
    isHoldingCenter.current = false;
    dragOffset.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y };
    lastPointers.current = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
    ghostRef.current?.setPointerCapture(e.pointerId);
    setIsFlying(false);
    clearTimeout(msgTimer.current);
    setMessage(null);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const nx = e.clientX - dragOffset.current.x;
    const ny = e.clientY - dragOffset.current.y;
    pos.current = { x: nx, y: ny };
    setDisplayPos({ x: nx, y: ny });
    updateBubblePos(nx, ny);
    lastPointers.current.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    if (lastPointers.current.length > 6) lastPointers.current.shift();
  }, [updateBubblePos]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    lastTouched.current = Date.now();
    const pts = lastPointers.current;
    let releasedSpeed = 0;
    if (pts.length >= 2) {
      const last = pts[pts.length - 1];
      const prev = pts[Math.max(0, pts.length - 3)];
      const dt = Math.max(last.t - prev.t, 16);
      vel.current = { x: ((last.x - prev.x) / dt) * 13, y: ((last.y - prev.y) / dt) * 13 };
      releasedSpeed = Math.sqrt(vel.current.x * vel.current.x + vel.current.y * vel.current.y);
    }
    lastPointers.current = [];
    showMessage(releasedSpeed > 0.9 ? 'nice throw.' : 'parked.', 4500);
  }, [showMessage]);

  if (!mounted) return null;

  const bubbleTopOffset = bubbleBelow ? GHOST_H + 10 : -50;

  return (
    <>
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: bubbleBelow ? -8 : 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', left: bubbleLeft, top: displayPos.y + bubbleTopOffset, width: BUBBLE_W, zIndex: 10000, pointerEvents: 'none' }}
          >
            <div style={{ background: 'rgba(20,18,14,0.94)', border: '1px solid rgba(240,235,224,0.13)', borderRadius: 9, padding: '7px 13px', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <span style={{ fontFamily: 'var(--g-mono)', fontSize: 11.5, letterSpacing: '0.01em', color: 'rgba(240,235,224,0.9)', display: 'block', textAlign: 'center' }}>
                {message}
              </span>
            </div>
            {!bubbleBelow && <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(20,18,14,0.94)' }} />}
            {bubbleBelow  && <div style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid rgba(20,18,14,0.94)' }} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ghost */}
      <div
        ref={ghostRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: GHOST_W,
          height: GHOST_H,
          transform: `translate3d(${displayPos.x.toFixed(2)}px, ${displayPos.y.toFixed(2)}px, 0)`,
          zIndex: 10000,
          cursor: isDragging.current ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          willChange: 'transform',
        }}
      >
        <div style={{ animation: isDancing ? 'ghostOrbit 0.85s ease-in-out 2' : isFlying ? 'none' : 'ghostFloat 6.5s ease-in-out infinite' }}>
          <GhostSVG size={GHOST_W} style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.45)) drop-shadow(0 0 2px rgba(240,235,224,0.06))' }} />
        </div>
      </div>
    </>
  );
}
