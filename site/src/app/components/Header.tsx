import { useState, useEffect } from 'react';
import { GhostMark } from './GhostSVG';
import { Github } from 'lucide-react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        transition: 'background 0.3s ease, border-color 0.3s ease',
        background: scrolled
          ? 'rgba(11, 10, 8, 0.82)'
          : 'transparent',
        borderBottom: scrolled
          ? '1px solid rgba(240, 230, 210, 0.06)'
          : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}
    >
      <div
        className="site-nav-frame"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 28px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo + wordmark */}
        <a
          href="#hero"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
          }}
        >
          <GhostMark size={22} />
          <span
            style={{
              fontFamily: 'var(--g-display)',
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--g-white)',
              letterSpacing: '0.01em',
              lineHeight: 1,
            }}
          >
            Ghostify
          </span>
        </a>

        {/* Nav links */}
        <nav className="site-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Platforms', 'Privacy'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                fontFamily: 'var(--g-sans)',
                fontSize: 13.5,
                fontWeight: 400,
                color: 'rgba(240, 235, 224, 0.52)',
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'color 0.18s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = 'rgba(240, 235, 224, 0.9)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = 'rgba(240, 235, 224, 0.52)';
              }}
            >
              {item}
            </a>
          ))}
          <a
            href="https://github.com/Hendrizzzz/Ghostify"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--g-sans)',
              fontSize: 13.5,
              fontWeight: 400,
              color: 'rgba(240, 235, 224, 0.52)',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'color 0.18s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = 'rgba(240, 235, 224, 0.9)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = 'rgba(240, 235, 224, 0.52)';
            }}
          >
            <Github size={14} strokeWidth={1.5} />
            GitHub
          </a>
        </nav>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .site-nav-frame {
            padding: 0 20px !important;
          }
          .site-nav {
            gap: 12px !important;
          }
          .site-nav a {
            font-size: 12px !important;
          }
        }
      `}</style>
    </header>
  );
}
