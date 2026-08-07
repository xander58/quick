import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import BottomCta from "@/components/landing/BottomCta";

export default function LandingPage() {
  return (
    <main>
      <LandingHeader />
      <Hero />
      <Features />
      <BottomCta />
    </main>
  );
}
