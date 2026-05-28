import { SplitSignalHero } from "@/components/landing/split-signal-hero";
import { PlatformMatrix } from "@/components/landing/platform-matrix";
import {
  FaqCaveats,
  InstallProof,
  LocalOnlyLedger,
  MechanismProof,
  SiteFooter,
} from "@/components/landing/trust-proof-sections";

export default function Home() {
  return (
    <main>
      <SplitSignalHero />
      <PlatformMatrix />
      <LocalOnlyLedger />
      <MechanismProof />
      <InstallProof />
      <FaqCaveats />
      <SiteFooter />
    </main>
  );
}
