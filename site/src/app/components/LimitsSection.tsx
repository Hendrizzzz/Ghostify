import { motion } from 'motion/react';

const LIMITS = [
  {
    title: 'Web only.',
    body: 'Ghostify works on messenger.com, facebook.com, and instagram.com. Native iOS and Android apps operate independently — the extension has no access there.',
  },
  {
    title: 'Platform updates can break things.',
    body: 'Meta changes their interfaces regularly. Some controls may stop working after an update. We fix them when we can, but there\'s no guarantee of instant coverage.',
  },
  {
    title: 'Already-sent signals stay sent.',
    body: 'Ghostify can\'t retroactively suppress read receipts or typing indicators that left the browser before it was enabled. It only intercepts from the moment it\'s active.',
  },
  {
    title: 'Server-side tracking is out of scope.',
    body: 'Ghostify controls browser-tab signals, not platform infrastructure. Meta\'s own analytics run server-side and are outside what a browser extension can touch.',
  },
];

export function LimitsSection() {
  return (
    <section
      style={{
        padding: 'clamp(56px, 8vw, 96px) clamp(28px, 4vw, 56px)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          className="limits-layout"
          style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'start' }}
        >
          {/* Left: heading */}
          <div>
            <h2 style={{ fontFamily: 'var(--g-sans)', fontSize: 'clamp(1.3rem, 1.8vw, 1.6rem)', fontWeight: 500, color: 'var(--g-white)', margin: '0 0 14px', lineHeight: 1.2, letterSpacing: 0 }}>
              No magic cloak.
            </h2>
            <p style={{ fontFamily: 'var(--g-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--g-body)', margin: 0, maxWidth: 280 }}>
              Ghostify does one thing well. Here's what falls outside that boundary.
            </p>
          </div>

          {/* Right: limits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {LIMITS.map((limit, i) => (
              <motion.div
                key={limit.title}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: 'clamp(18px, 2vw, 24px) 0',
                  borderBottom: i < LIMITS.length - 1 ? '1px solid rgba(240,230,210,0.06)' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 2fr',
                  gap: 'clamp(20px, 3vw, 40px)',
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--g-sans)', fontSize: 15, fontWeight: 500, color: 'rgba(240,235,224,0.65)', lineHeight: 1.3, letterSpacing: 0, paddingTop: 2 }}>
                  {limit.title}
                </div>
                <p style={{ fontFamily: 'var(--g-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--g-body)', margin: 0 }}>
                  {limit.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 840px) {
          .limits-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 600px) {
          .limits-layout > div:last-child > div { grid-template-columns: 1fr !important; gap: 8px !important; }
        }
      `}</style>
    </section>
  );
}
