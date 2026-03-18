import { motion } from "framer-motion";
import { MessageCircle, Mail, Gamepad2, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACTS, WHATSAPP_BASE } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

const iconMap = { MessageCircle, Mail, Gamepad2, Instagram };

const Contact = () => {
  return (
    <SectionWrapper id="contact">
      <div className="container mx-auto px-4">
        <SectionHeader title="Contact Nuclear Studio" subtitle="Let's build content that performs." />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
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

        <div className="text-center">
          <a
            href={`${WHATSAPP_BASE}?text=Hi%20Nuclear%20Edits,%20I%20want%20to%20talk%20about%20your%20services.`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="nuclear" size="xl">Contact Us</Button>
          </a>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Contact;
