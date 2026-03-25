import { motion } from "framer-motion";
import { Mail, Gamepad2, Instagram } from "lucide-react";
import { CONTACTS } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

const iconMap = { Mail, Gamepad2, Instagram };

const Contact = () => {
  return (
    <SectionWrapper id="contact">
      <div className="container mx-auto px-4">
        <SectionHeader title="Contact AntiGeneric AI" subtitle="Questions? Feedback? We'd love to hear from you." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {CONTACTS.map((c, i) => {
            const Icon = iconMap[c.icon];
            return (
              <motion.a
                key={c.type}
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 rounded-xl card-nuclear text-center transition-all duration-300 hover:scale-[1.03]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                  <Icon size={20} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">{c.type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.display}</p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Contact;
