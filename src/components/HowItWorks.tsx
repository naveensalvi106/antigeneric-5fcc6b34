import { motion } from "framer-motion";
import { Upload, Search, Sparkles, LayoutGrid, UserCheck, ArrowUpCircle, CheckCircle, Send } from "lucide-react";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

const STEPS = [
  {
    icon: Upload,
    title: "You Share the Details",
    description: "Provide your video title, topic, and any reference images or face shots you'd like included.",
  },
  {
    icon: Search,
    title: "We Research What Works",
    description: "Our AI scans top-performing thumbnails in your niche to identify winning visual patterns.",
  },
  {
    icon: Sparkles,
    title: "Scenes & Elements Are Generated",
    description: "Using Nano Banana and Seedreams, we create custom scenes, backgrounds, and graphic elements.",
  },
  {
    icon: LayoutGrid,
    title: "Smart Composition",
    description: "Every element is placed and aligned for maximum visual impact and click-through rate.",
  },
  {
    icon: UserCheck,
    title: "Face & Element Retouching",
    description: "Faces and key elements are enhanced to look sharp, natural, and attention-grabbing.",
  },
  {
    icon: ArrowUpCircle,
    title: "4K Upscale with Kling AI",
    description: "Your thumbnail is upscaled to crystal-clear 4K resolution for every screen size.",
  },
  {
    icon: CheckCircle,
    title: "Final Polish",
    description: "A final retouch pass ensures every detail is pixel-perfect before delivery.",
  },
  {
    icon: Send,
    title: "Delivered to You",
    description: "Your finished thumbnail is sent to your email and available in your AntiGeneric AI dashboard.",
  },
];

const HowItWorks = () => {
  return (
    <SectionWrapper id="how-it-works">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="How Our AI Works"
          subtitle="From your idea to a scroll-stopping thumbnail — fully automated, no design skills needed."
        />

        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden sm:block" />

          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="flex items-start gap-4 md:gap-6 group"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  {/* Step number + icon */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon size={20} strokeWidth={1.5} className="text-primary" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-1 md:pt-2">
                    <h3 className="font-display font-semibold text-sm md:text-base text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default HowItWorks;
