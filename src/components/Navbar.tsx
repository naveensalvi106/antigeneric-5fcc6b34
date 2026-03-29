import { useState, useEffect, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Coins, Shield, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/data/siteData";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
        loadCredits(session.user.id);
      } else {
        setIsAdmin(false);
        setCredits(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
        loadCredits(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    setIsAdmin(!!(data && data.length > 0));
  };

  const loadCredits = async (userId: string) => {
    const { data } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();
    setCredits(data?.credits ?? 0);
  };

  const handleNavClick = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const navbarOffset = 88;
    const top = target.getBoundingClientRect().top + window.scrollY - navbarOffset;
    window.history.replaceState(null, "", href);
    window.scrollTo({ top, behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleAuthAction = (e: MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/60 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="border-b border-transparent" style={{
        borderImage: "linear-gradient(to right, transparent, hsl(217 91% 60% / 0.2), transparent) 1"
      }}>
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group">
              <img src="/images/logo.png" alt="AntiGeneric AI" className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110" />
              <span className="font-display font-bold text-lg text-foreground">
                AntiGeneric <span className="gradient-text">AI</span>
              </span>
            </a>
            <a
              href={user ? "#pricing" : "/login"}
              onClick={user ? handleNavClick("#pricing") : (e) => { e.preventDefault(); navigate("/login"); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-display tracking-tight text-primary-foreground bg-gradient-to-b from-[hsl(210,100%,70%)] via-[hsl(217,91%,55%)] to-[hsl(220,90%,45%)] border border-white/20 shadow-[0_0_25px_-5px_hsl(217_91%_60%/0.5),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_-5px_hsl(217_91%_60%/0.7),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <Coins size={16} />
              {credits !== null ? credits : 1} Credit{(credits !== null ? credits : 1) !== 1 ? "s" : ""}
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick(link.href)}
                className="relative px-4 py-2 text-sm text-muted-foreground font-medium transition-colors duration-300 hover:text-foreground rounded-lg hover:bg-primary/5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user && (
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold font-display tracking-tight text-primary-foreground bg-gradient-to-b from-[hsl(210,100%,70%)] via-[hsl(217,91%,55%)] to-[hsl(220,90%,45%)] border border-white/20 shadow-[0_0_25px_-5px_hsl(217_91%_60%/0.5),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_-5px_hsl(217_91%_60%/0.7),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-all duration-300"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="gap-1.5"
              >
                <Shield size={14} />
                Admin
              </Button>
            )}
            <a
              href={user ? "#pricing" : "/login"}
              onClick={(e) => { if (!user) { e.preventDefault(); navigate("/login"); } }}
            >
              <Button variant="nuclear" size="sm">{user ? "Try Free" : "Login"}</Button>
            </a>
          </div>

          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden relative z-50"
          >
            <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick(link.href)}
                  className="px-4 py-3 text-sm text-muted-foreground font-medium rounded-lg hover:bg-primary/5 hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {isAdmin && (
                <button
                  onClick={() => { navigate("/admin"); setMobileOpen(false); }}
                  className="px-4 py-3 text-sm text-muted-foreground font-medium rounded-lg hover:bg-primary/5 hover:text-foreground transition-colors text-left flex items-center gap-2"
                >
                  <Shield size={16} /> Admin Panel
                </button>
              )}
              {user && (
                <button
                  onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}
                  className="px-4 py-3 text-sm text-muted-foreground font-medium rounded-lg hover:bg-primary/5 hover:text-foreground transition-colors text-left flex items-center gap-2"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
              )}
              <a
                href={user ? "#pricing" : "/login"}
                onClick={(e) => { if (!user) { e.preventDefault(); navigate("/login"); setMobileOpen(false); } }}
                className="mt-2"
              >
                <Button variant="nuclear" className="w-full">{user ? "Try Free" : "Login"}</Button>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
