import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

const Pricing = () => {
  return (
    <SectionWrapper id="pricing">
      <div className="container mx-auto px-4">
        <SectionHeader title="Editing Plans" subtitle="Flexible options for creators at every level." />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PRICING.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] ${
                plan.popular
                  ? "bg-card glow-blue-strong border border-primary/20 lg:scale-105"
                  : "bg-card card-nuclear"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold font-display">
                  <Crown size={12} strokeWidth={1.5} />
                  Most Popular
                </div>
              )}

              <h3 className="font-display font-bold text-lg text-foreground mb-1">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-5">
                <span className="font-display font-extrabold text-2xl text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground ml-1">{plan.per}</span>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check size={16} strokeWidth={1.5} className="text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <a href={plan.waLink} target="_blank" rel="noopener noreferrer">
                <Button
                  variant={plan.popular ? "nuclear" : "nuclear-outline"}
                  className="w-full"
                >
                  Select
                </Button>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Pricing;
