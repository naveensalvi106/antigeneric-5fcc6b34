// Footer component
import { NAV_LINKS } from "@/data/siteData";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap size={20} strokeWidth={1.5} className="text-primary" />
            <span className="font-display font-bold text-foreground">Nuclear Edits</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-xs text-muted-foreground">
            © 2026 Nuclear Edits. All rights reserved.
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Premium Editing for Serious Creators
        </p>
      </div>
    </footer>
  );
};

export default Footer;
