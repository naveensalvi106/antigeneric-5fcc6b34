import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

import business1 from "@/assets/thumbnails/business-1.jpg";
import business2 from "@/assets/thumbnails/business-2.jpg";
import business3 from "@/assets/thumbnails/business-3.jpg";
import business4 from "@/assets/thumbnails/business-4.jpg";
import business5 from "@/assets/thumbnails/business-5.jpg";
import business6 from "@/assets/thumbnails/business-6.jpg";
import business7 from "@/assets/thumbnails/business-7.jpg";
import business8 from "@/assets/thumbnails/business-8.jpg";
import business9 from "@/assets/thumbnails/business-9.jpg";
import business10 from "@/assets/thumbnails/business-10.jpg";

import gaming1 from "@/assets/thumbnails/gaming-1.jpg";
import gaming2 from "@/assets/thumbnails/gaming-2.jpg";
import gaming3 from "@/assets/thumbnails/gaming-3.jpg";
import gaming4 from "@/assets/thumbnails/gaming-4.jpg";
import gaming5 from "@/assets/thumbnails/gaming-5.jpg";
import gaming6 from "@/assets/thumbnails/gaming-6.jpg";
import gaming7 from "@/assets/thumbnails/gaming-7.jpg";
import gaming8 from "@/assets/thumbnails/gaming-8.jpg";
import gaming9 from "@/assets/thumbnails/gaming-9.jpg";
import gaming10 from "@/assets/thumbnails/gaming-10.jpg";

import irl1 from "@/assets/thumbnails/irl-1.jpg";
import irl2 from "@/assets/thumbnails/irl-2.jpg";
import irl3 from "@/assets/thumbnails/irl-3.jpg";
import irl4 from "@/assets/thumbnails/irl-4.jpg";
import irl5 from "@/assets/thumbnails/irl-5.jpg";
import irl6 from "@/assets/thumbnails/irl-6.jpg";
import irl7 from "@/assets/thumbnails/irl-7.jpg";
import irl8 from "@/assets/thumbnails/irl-8.jpg";
import irl9 from "@/assets/thumbnails/irl-9.jpg";
import irl10 from "@/assets/thumbnails/irl-10.jpg";

interface ThumbnailSection {
  id: string;
  title: string;
  thumbnails: { src: string; alt: string }[];
}

const categoryNames = ["Business", "Gaming", "IRL", "Reaction", "Self Improvement", "Tech", "Documentary"];

const sections: ThumbnailSection[] = [
  {
    id: "irl",
    title: "IRL",
    thumbnails: [
      { src: irl1, alt: "School Locker Prank" },
      { src: irl2, alt: "Magnet Fishing Gold" },
      { src: irl3, alt: "Mario Kart Cosplay" },
      { src: irl4, alt: "Red Button Challenge" },
      { src: irl5, alt: "Strongman Concrete" },
      { src: irl6, alt: "Gunther Rich Dog" },
      { src: irl7, alt: "Waterpark Sneak In" },
      { src: irl8, alt: "Sword Watermelon" },
      { src: irl9, alt: "Car Crash Escape" },
      { src: irl10, alt: "Prison Break FBI" },
    ],
  },
  {
    id: "gaming",
    title: "Gaming",
    thumbnails: [
      { src: gaming1, alt: "Ghost of Yotei" },
      { src: gaming2, alt: "Gold Camo 250" },
      { src: gaming3, alt: "Dust 2 Flooded" },
      { src: gaming4, alt: "Mystery Chest" },
      { src: gaming5, alt: "Fortnite FAQ" },
      { src: gaming6, alt: "Invisible Glitch" },
      { src: gaming7, alt: "Casier 2026" },
      { src: gaming8, alt: "Roblox Obby" },
      { src: gaming9, alt: "Roblox Adventure" },
      { src: gaming10, alt: "Stickman Battle" },
    ],
  },
  {
    id: "business",
    title: "Business",
    thumbnails: [
      { src: business1, alt: "Copy Me - Business Growth" },
      { src: business2, alt: "Email Marketing Strategy" },
      { src: business3, alt: "Photoshop Skills" },
      { src: business4, alt: "10X More Clients" },
      { src: business5, alt: "Money Strategies" },
      { src: business6, alt: "Multiple Income Streams" },
      { src: business7, alt: "Best AI Tools 2025" },
      { src: business8, alt: "$0 to $10M Journey" },
      { src: business9, alt: "Trading Profit" },
      { src: business10, alt: "AI Workshop Revenue" },
    ],
  },
  { id: "reaction", title: "Reaction", thumbnails: [] },
  { id: "self-improvement", title: "Self Improvement", thumbnails: [] },
  { id: "tech", title: "Tech", thumbnails: [] },
  { id: "documentary", title: "Documentary", thumbnails: [] },
];

const Examples = () => {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight gradient-text mb-4">
              Thumbnail Examples
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every thumbnail below was generated by AntiGeneric AI.
            </p>
          </motion.div>

          {/* Category navigation */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {categoryNames.map((name) => {
              const id = name.toLowerCase().replace(/\s+/g, "-");
              return (
                <Button
                  key={id}
                  variant="nuclear"
                  size="sm"
                  onClick={() => scrollToSection(id)}
                >
                  {name}
                </Button>
              );
            })}
          </motion.div>

          {sections.map((section, sIdx) => (
            section.thumbnails.length > 0 && (
              <motion.div
                key={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                className="mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sIdx * 0.1 }}
              >
                <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text mb-6 text-center">
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.thumbnails.map((thumb, i) => (
                    <motion.div
                      key={i}
                      className="rounded-xl overflow-hidden card-nuclear group cursor-pointer"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={thumb.src}
                          alt={thumb.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 border border-transparent group-hover:border-primary/30 rounded-xl transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          ))}

          {/* Empty sections placeholder */}
          {sections.filter(s => s.thumbnails.length === 0).length > 0 && (
            <div className="text-center text-muted-foreground py-8">
              {sections.filter(s => s.thumbnails.length === 0).map(s => (
                <div
                  key={s.id}
                  ref={(el) => { sectionRefs.current[s.id] = el; }}
                  className="mb-8"
                >
                  <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text mb-3">
                    {s.title}
                  </h2>
                  <p className="text-sm">Coming soon...</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Examples;
