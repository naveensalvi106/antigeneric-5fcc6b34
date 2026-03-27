import { motion } from "framer-motion";
import { Upload, Search, Sparkles, LayoutGrid, UserCheck, ArrowUpCircle, CheckCircle, Send } from "lucide-react";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Upload,
    title: "Share Details",
    description: "Provide your video title, topic, and reference images.",
  },
  {
    icon: Search,
    title: "AI Research",
    description: "Our AI scans top thumbnails in your niche for winning patterns.",
  },
  {
    icon: Sparkles,
    title: "Generate Scenes",
    description: "Custom scenes, backgrounds, and elements are created with AI.",
  },
  {
    icon: LayoutGrid,
    title: "Smart Composition",
    description: "Elements placed for maximum visual impact and CTR.",
  },
  {
    icon: UserCheck,
    title: "Face Retouching",
    description: "Faces enhanced to look sharp and attention-grabbing.",
  },
  {
    icon: ArrowUpCircle,
    title: "4K Upscale",
    description: "Upscaled to crystal-clear 4K resolution.",
  },
  {
    icon: CheckCircle,
    title: "Final Polish",
    description: "Every detail is pixel-perfect before delivery.",
  },
  {
    icon: Send,
    title: "Delivered",
    description: "Sent to your email and AntiGeneric AI dashboard.",
  },
];

const HowItWorks = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SectionWrapper id="how-it-works">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="How Our AI Works"
          subtitle="From idea to scroll-stopping thumbnail — fully automated."
        />

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="p-4 rounded-xl card-nuclear border border-primary/10 hover:border-primary/20 transition-all duration-300 text-center group"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <div className="relative mx-auto w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon size={18} strokeWidth={1.5} className="text-primary" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-xs md:text-sm text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* CTA to generate */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Button variant="nuclear" size="lg" onClick={scrollToTop}>
              <Sparkles size={18} className="mr-2" />
              Generate Your Thumbnail Now
            </Button>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default HowItWorks;
