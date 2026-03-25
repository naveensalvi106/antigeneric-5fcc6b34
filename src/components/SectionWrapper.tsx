import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SectionWrapperProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper = ({ id, children, className = "" }: SectionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id={id} className={`relative py-10 md:py-14 ${className}`}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
};

export const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center mb-16">
    <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-balance gradient-text mb-4">
      {title}
    </h2>
    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

export const GlowSeparator = () => (
  <div className="section-glow w-full" />
);
