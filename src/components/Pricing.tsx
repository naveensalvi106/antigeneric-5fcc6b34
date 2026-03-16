import { motion } from "framer-motion";
import { Check, Crown, Scissors, Sparkles, Film, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

const planIcons = [Scissors, Sparkles, Film, Smartphone];

const Pricing = () => {
  return (
    <SectionWrapper id="pricing">
      <div className="container mx-auto px-4">
        <SectionHeader title="Editing Plans" subtitle="Flexible options for creators at every level." />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {PRICING.map((plan, i) => {
            const Icon = planIcons[i];
            return (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col card-nuclear ${
                  plan.popular
                    ? "glow-blue-strong border-primary/30 lg:scale-105"
                    : ""
                }`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {plan.popular && (
                  <div className="absolute -top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
                )}

                {/* Header block */}
                <div className={`px-6 pt-7 pb-5 ${plan.popular ? "mt-1" : ""}`}>
                  {plan.popular && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold font-display mb-4">
                      <Crown size={12} strokeWidth={2} />
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon size={20} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground">{plan.name}</h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                {/* Price block */}
                <div className="px-6 py-4 border-y border-border/50 bg-secondary/30">
                  <span className="font-display font-extrabold text-2xl text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground ml-2">{plan.per}</span>
                </div>

                {/* Features block */}
                <div className="px-6 py-5 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">What's included</p>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} strokeWidth={2.5} className="text-primary" />
                        </div>
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 pt-2">
                  <a href={plan.waLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant={plan.popular ? "nuclear" : "nuclear-outline"}
                      className="w-full"
                    >
                      Select
                    </Button>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Pricing;