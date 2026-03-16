import { motion } from "framer-motion";
import { Play, Film, Image, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_BASE } from "@/data/siteData";

const badges = [
  { icon: Film, label: "Long-form Editing" },
  { icon: Play, label: "Shorts / Reels" },
  { icon: Image, label: "Thumbnails" },
  { icon: TrendingUp, label: "Creator Growth" },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-blob-delay-2" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary/6 rounded-full blur-3xl animate-blob-delay-4" />
        {/* Radar pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-primary/10 animate-radar" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.p
            className="text-primary font-display font-semibold text-sm md:text-base tracking-widest uppercase mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Premium Content Operations Agency
          </motion.p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-balance mb-6">
            Premium Video Editing That{" "}
            <span className="gradient-text">Grows Your Channel</span>
          </h1>

          <motion.p
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            We help creators scale with engaging edits, clickable thumbnails, shorts, and full content operations.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a
              href={`${WHATSAPP_BASE}?text=Hi%20Nuclear%20Edits,%20I%20want%20to%20get%20started%20with%20video%20editing.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="nuclear" size="xl" className="w-full sm:w-auto">
                Get Started on WhatsApp
              </Button>
            </a>
            <a href="#videos">
              <Button variant="nuclear-outline" size="xl" className="w-full sm:w-auto">
                View Our Work
              </Button>
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 md:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-sm text-muted-foreground font-medium"
              >
                <badge.icon size={16} strokeWidth={1.5} className="text-primary" />
                {badge.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
