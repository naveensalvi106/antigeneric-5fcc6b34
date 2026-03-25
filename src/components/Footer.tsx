import { NAV_LINKS } from "@/data/siteData";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="AntiGeneric AI" className="w-7 h-7 object-contain" />
            <span className="font-display font-bold text-foreground">AntiGeneric AI</span>
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
            © 2026 AntiGeneric AI. All rights reserved.
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          AI-Powered Thumbnails for Serious Creators
        </p>
      </div>
    </footer>
  );
};

export default Footer;
