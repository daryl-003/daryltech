import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, LayoutDashboard, LogIn, LogOut, Facebook, Instagram,
  Linkedin, Twitter, MessageCircle, ArrowUpRight, Github
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/daryl-tech-logo.png.asset.json";
const logo = logoAsset.url;

const navItems = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Courses", path: "/courses" },
  { label: "Internships", path: "/internships" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "Book a Call", path: "/booking" },
  { label: "Contact", path: "/contact" },
];

const socials = [
  { icon: Instagram, href: "https://www.instagram.com/daryltech_official?igsh=dm42cmVtdG0wdGdn&utm_source=qr", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/daryltecheducationalnetwork?mibextid=wwXIfr&mibextid=wwXIfr", label: "Facebook" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/daryl-tech-educational-network", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/daryl_tech?s=21", label: "X" },
  { icon: MessageCircle, href: "https://wa.me/+233509147164", label: "WhatsApp" },
  { icon: Github, href: "https://github.com/daryl-tech003", label: "GitHub" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  // theme toggle removed per design
  const [user, setUser] = useState<any>(null);
  const [dashboardPath, setDashboardPath] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) resolveRole(session.user.id); else setDashboardPath(null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) resolveRole(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const resolveRole = async (userId: string) => {
    const { data: a } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (a) return setDashboardPath("/admin/dashboard");
    const { data: s } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "staff").maybeSingle();
    if (s) return setDashboardPath("/staff/dashboard");
    setDashboardPath("/student/dashboard");
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setOpen(false); };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className={`transition-all duration-300 ${open ? "bg-transparent" : "bg-background/70 backdrop-blur-xl border-b border-border/40"}`}>
          <div className="mx-auto flex items-center justify-between px-6 py-4 md:px-10">
            <Link to="/" aria-label="Daryl Tech & Educational Network" className="shrink-0">
              <span className="inline-flex h-11 items-center rounded-md bg-neutral-900 px-2 dark:bg-transparent dark:px-0">
                <img src={logo} alt="Daryl Tech & Educational Network" className="h-10 w-auto object-contain" />
              </span>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setOpen(true)}
                className="group inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/40 px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-foreground transition-all hover:border-primary hover:text-primary"
                aria-label="Open menu"
              >
                Menu
                <span className="flex flex-col gap-[3px]">
                  <span className="h-[2px] w-4 bg-current transition-transform group-hover:translate-x-0.5" />
                  <span className="h-[2px] w-4 bg-current transition-transform group-hover:-translate-x-0.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Vertical social rail (desktop) — icon-only */}
      <div className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <div className="flex flex-col items-center gap-3 py-4 pr-4">
          <span className="mb-1 h-8 w-px bg-border/60" aria-hidden />
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/40 backdrop-blur text-foreground/60 transition-all hover:border-primary hover:text-primary hover:scale-110"
            >
              <s.icon size={15} className="transition-transform group-hover:rotate-6" />
            </a>
          ))}
          <span className="mt-1 h-8 w-px bg-border/60" aria-hidden />
        </div>
      </div>

      {/* Full screen overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-6 py-4 md:px-10">
                <Link to="/" aria-label="Home" className="shrink-0">
                  <span className="inline-flex h-11 items-center rounded-md bg-neutral-900 px-2 dark:bg-transparent dark:px-0">
                    <img src={logo} alt="Daryl Tech" className="h-10 w-auto object-contain" />
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-3 rounded-full border border-border px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-foreground transition-colors hover:text-primary hover:border-primary"
                  aria-label="Close menu"
                >
                  Close <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-12 pt-6 md:px-16">
                <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
                  {/* Nav links */}
                  <div>
                    <p className="mb-6 text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Navigate</p>
                    <ul className="space-y-1">
                      {navItems.map((item, i) => (
                        <motion.li
                          key={item.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + i * 0.04 }}
                        >
                          <Link
                            to={item.path}
                            className={`group flex items-center justify-between border-b border-border/40 py-3 text-3xl font-semibold tracking-tight transition-colors md:text-5xl ${
                              location.pathname === item.path ? "text-primary" : "text-foreground hover:text-primary"
                            }`}
                          >
                            <span>{item.label}</span>
                            <ArrowUpRight className="h-6 w-6 opacity-0 transition-all group-hover:opacity-100 md:h-8 md:w-8" />
                          </Link>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {user && dashboardPath ? (
                        <>
                          <Link to={dashboardPath} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                            <LayoutDashboard size={15} /> Dashboard
                          </Link>
                          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-destructive hover:text-destructive">
                            <LogOut size={15} /> Logout
                          </button>
                        </>
                      ) : (
                        <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                          <LogIn size={15} /> Sign In
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Side info */}
                  <div className="space-y-8 lg:border-l lg:border-border/40 lg:pl-12">
                    <div>
                      <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Get in touch</p>
                      <a href="mailto:daryltecheducationalnetwork@gmail.com" className="block text-lg font-medium text-foreground hover:text-primary break-all">
                        daryltecheducationalnetwork@gmail.com
                      </a>
                      <a href="tel:+233509147164" className="mt-1 block text-sm text-muted-foreground hover:text-primary">
                        +233 50 914 7164
                      </a>
                      <p className="mt-1 text-sm text-muted-foreground">Accra, Ghana</p>
                    </div>

                    <div>
                      <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Follow</p>
                      <div className="flex flex-wrap gap-3">
                        {socials.map((s) => (
                          <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={s.label}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground/70 transition-all hover:border-primary hover:text-primary"
                          >
                            <s.icon size={16} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
