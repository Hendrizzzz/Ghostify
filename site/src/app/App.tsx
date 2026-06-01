import { GhostMascot } from './components/GhostMascot';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DemoSection } from './components/DemoSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PlatformSection } from './components/PlatformSection';
import { PersonalityBand } from './components/PersonalityBand';
import { PrivacySection } from './components/PrivacySection';
import { LightweightSection } from './components/LightweightSection';
import { LimitsSection } from './components/LimitsSection';
import { FAQSection } from './components/FAQSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--g-bg)',
        color: 'var(--g-white)',
        position: 'relative',
      }}
    >
      {/* Grain overlay */}
      <div className="grain-layer" aria-hidden="true" />

      {/* Draggable mascot — sits above everything */}
      <GhostMascot />

      {/* Navigation */}
      <Header />

      {/* Page sections */}
      <main>
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <PlatformSection />
        <PersonalityBand />
        <PrivacySection />
        <LightweightSection />
        <LimitsSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 640px) {
          body { overflow-x: hidden; }
        }
        *:focus-visible {
          outline: 2px solid rgba(196,72,48,0.6);
          outline-offset: 3px;
          border-radius: 4px;
        }
        ::selection {
          background: rgba(196,72,48,0.25);
          color: var(--g-white);
        }
      `}</style>
    </div>
  );
}
