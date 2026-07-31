import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Mission } from "@/components/Mission";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { Providers } from "@/components/Providers";
import { Integration } from "@/components/Integration";
import { Security } from "@/components/Security";
import { CTABand } from "@/components/CTABand";
import { Footer } from "@/components/Footer";
import { FooterWordmark } from "@/components/FooterWordmark";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Mission />
        <HowItWorks />
        <Features />
        <Providers />
        <Integration />
        <Security />
        <CTABand />
      </main>

      <Footer />
      <FooterWordmark />
    </>
  );
}
