import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ChannelStats from "@/components/ChannelStats";

import ThumbnailShowcase from "@/components/ThumbnailShowcase";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { GlowSeparator } from "@/components/SectionWrapper";
import ParticleBackground from "@/components/ParticleBackground";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <ParticleBackground />
      <div className="relative z-10">
      <Navbar />
      <Hero />
      <GlowSeparator />
      <ChannelStats />
      <GlowSeparator />
      <Testimonials />
      <GlowSeparator />
      <Pricing />
      <GlowSeparator />
      <FAQ />
      <GlowSeparator />
      <Contact />
      <GlowSeparator />
      <Footer />
      </div>
    </div>
  );
};

export default Index;
