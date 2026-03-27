import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ChannelStats from "@/components/ChannelStats";

import ThumbnailShowcase from "@/components/ThumbnailShowcase";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { GlowSeparator } from "@/components/SectionWrapper";
import ParticleBackground from "@/components/ParticleBackground";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.trim();

    if (
      !hash ||
      hash === "#" ||
      hash.includes("access_token") ||
      hash.includes("refresh_token") ||
      hash.includes("error=")
    ) {
      return;
    }

    try {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } catch {
      // Ignore invalid auth callback hashes.
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <ParticleBackground />
      <div className="relative z-10">
      <Navbar />
      <Hero />
      <GlowSeparator />
      <ThumbnailShowcase />
      <GlowSeparator />
      <ChannelStats />
      <GlowSeparator />
      <Testimonials />
      <GlowSeparator />
      <Pricing />
      <GlowSeparator />
      <FAQ />
      <GlowSeparator />
      <HowItWorks />
      <GlowSeparator />
      <Footer />
      </div>
    </div>
  );
};

export default Index;
