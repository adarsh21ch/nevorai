import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StorySections } from "@/components/landing/StorySections";
import { WhoIsItFor } from "@/components/landing/WhoIsItFor";
import { ResultsComparison } from "@/components/landing/ResultsComparison";
import { ConversionCalculator } from "@/components/landing/ConversionCalculator";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WhoUsesNevorai } from "@/components/landing/WhoUsesNevorai";
import { EarlyAccess } from "@/components/landing/EarlyAccess";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { brand } from "@/config/brand";

/**
 * Detect installed-PWA launches (standalone / fullscreen / minimal-ui, plus
 * iOS Safari's navigator.standalone). Runs only on the client.
 */
const isStandalonePWA = (): boolean => {
  if (typeof window === "undefined") return false;
  const mql = window.matchMedia?.(
    "(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iosStandalone = (window.navigator as any).standalone === true;
  return !!(mql?.matches || iosStandalone);
};

const Index = () => {
  const router = useRouter();

  // Redirect installed-PWA launches AFTER hydration to avoid an SSR/CSR
  // markup mismatch (server renders landing page; client used to return
  // null via <Navigate />, which caused React error #418 → white screen).
  useEffect(() => {
    if (isStandalonePWA()) {
      router.navigate({ to: "/dashboard", replace: true });
    }
  }, [router]);

  return (
    <div className="landing-page relative min-h-screen overflow-x-clip">
      <Navbar />
      <HeroSection />
      <StorySections ids={["story.skip", "story.no-skip"]} />
      <WhoIsItFor />
      <StorySections ids={["story.unknown", "story.realtime", "story.clutter", "story.clean"]} />
      <ResultsComparison />
      <ConversionCalculator />
      <FeaturesSection />
      <WhoUsesNevorai />
      <EarlyAccess />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
