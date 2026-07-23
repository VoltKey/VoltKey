import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { Providers } from "@/components/Providers";
import { Integration } from "@/components/Integration";
import { CTABand } from "@/components/CTABand";
import { Footer } from "@/components/Footer";
import { FooterWordmark } from "@/components/FooterWordmark";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Providers />
        <Integration />
        <CTABand />
      </main>

      <Footer />
      <FooterWordmark />
    </>
  );
}
