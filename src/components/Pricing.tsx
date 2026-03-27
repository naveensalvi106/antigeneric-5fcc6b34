import { motion } from "framer-motion";
import { Check, Crown, Zap, Rocket, Gift } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";
import { supabase } from "@/integrations/supabase/client";
import PaymentDialog from "@/components/PaymentDialog";

const planIcons = [Gift, Zap, Rocket];

const Pricing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [paymentPlan, setPaymentPlan] = useState<typeof PRICING[0] | null>(null);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const PAYPAL_PRO = "https://www.paypal.com/ncp/payment/4B3DWRU97Y5PA";
  const PAYPAL_AGENCY = "https://www.paypal.com/ncp/payment/XQ4DW6W76WKYN";

  const handlePlanClick = (plan: typeof PRICING[0]) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (plan.name === "Free") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPaymentPlan(plan);
  };

  const getPaypalLink = (planName: string) =>
    planName === "Pro" ? PAYPAL_PRO : PAYPAL_AGENCY;

  return (
    <SectionWrapper id="pricing">
      <div className="container mx-auto px-4">
        <SectionHeader title="Pick Your Plan" subtitle="No subscriptions. Buy credits, generate thumbnails." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
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

                <div className="px-6 py-4 border-y border-white/10 bg-white/5 space-y-4">
                  <div>
                    <span className="font-display font-extrabold text-2xl text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground ml-2">{plan.per}</span>
                  </div>
                  {/* Credit highlight */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30">
                    <span className="font-display font-extrabold text-xl gradient-text">
                      {plan.name === "Free" ? "1" : plan.name === "Pro" ? "10" : "25"}
                    </span>
                    <span className="text-sm font-semibold text-foreground">Credits</span>
                  </div>
                </div>

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

                <div className="px-6 pb-6 pt-2">
                  <Button
                    variant="nuclear"
                    className="w-full"
                    onClick={() => handlePlanClick(plan)}
                  >
                    {plan.ctaLabel}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {paymentPlan && (
        <PaymentDialog
          open={!!paymentPlan}
          onOpenChange={(open) => !open && setPaymentPlan(null)}
          planName={paymentPlan.name}
          price={paymentPlan.price}
          paypalLink={getPaypalLink(paymentPlan.name)}
        />
      )}
    </SectionWrapper>
  );
};

export default Pricing;
