import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingMarquee } from "@/components/landing/landing-marquee";
import { LandingPricing } from "@/components/landing/landing-pricing";

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-surface-base text-white">
      <LandingHeader />
      <main className="hero-gradient relative min-h-screen px-6 pt-32 pb-20">
        <div className="mx-auto max-w-7xl">
          {/* <LandingHero /> 
          <LandingMarquee />
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingPricing />
          <LandingCta />*/}
        </div>
      </main>
      {/* <LandingFooter /> */}
    </div>
  );
}
