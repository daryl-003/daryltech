import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, MessageCircle, Mail, Phone, MapPin, ArrowUpRight, Github } from "lucide-react";
import logoAsset from "@/assets/daryl-tech-logo.png.asset.json";
import NewsletterForm from "./NewsletterForm";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Services", path: "/services" },
      { label: "Portfolio", path: "/portfolio" },
      { label: "Contact", path: "/contact" },

    ],
  },

  {
    title: "Learn",
    links: [
      { label: "Courses", path: "/courses" },
      { label: "Internships", path: "/internships" },
      { label: "Verify Enrollment", path: "/courses/verify" },
      { label: "Blog", path: "/blog" },
    ],
  },

  {
   title: "Services",
    links: [
      { label: "Web Development", path: "/courses" },
      { label: "Mobile App Development", path: "/courses" },
      { label: "UI/UX Design", path: "/courses" },
      { label: "Cybersecurity", path: "/courses" },
      { label: "Cloud Solutions", path: "/courses" },
      { label: "Database & Management systems", path: "/courses" },
      { label: "Linux Administration", path: "/courses" },
      { label: "IT Support and Consulting", path: "/courses" },
      { label: "AI & Automation", path: "/courses" },
      { label: "Networking", path: "/courses" }, 
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Book a Call", path: "/booking" },
      { label: "Sign In", path: "/auth" },
      { label: "Intern Portal", path: "/student/dashboard" },
    ],
  },
];

const socials = [
  { icon: Instagram, href: "https://www.instagram.com/daryltech_official", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/daryltecheducationalnetwork", label: "Facebook" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/daryl-tech-educational-network", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/daryl_tech", label: "X" },
  { icon: MessageCircle, href: "https://wa.me/+233509147164", label: "WhatsApp" },
  { icon: Github, href: "https://github.com/daryl-tech003", label: "GitHub" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" aria-label="Daryl Tech — Home" className="inline-flex items-center gap-3">
              <img src={logoAsset.url} alt="Daryl Tech" className="h-10 w-auto object-contain" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Building the future of tech through world-class engineering and next-generation education across Africa.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <a href="mailto:daryltecheducationalnetwork@gmail.com" className="flex items-center gap-2 hover:text-primary">
                <Mail size={14} /> daryltecheducationalnetwork@gmail.com
              </a>
              <a href="tel:+233509147164" className="flex items-center gap-2 hover:text-primary">
                <Phone size={14} /> +233 50 914 7164
              </a>
              <p className="flex items-center gap-2"><MapPin size={14} /> Accra, Ghana</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition-all hover:border-primary hover:text-primary"
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.3em] text-primary">// {col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                      <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


        {/* Newsletter */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="mx-auto max-w-md text-center">
            <h4 className="mb-2 text-sm font-semibold">Subscribe to our Newsletter</h4>
            <p className="mb-4 text-xs text-muted-foreground">Get the latest updates on tech, courses, internships and company news.</p>
            <NewsletterForm />
          </div>
        </div>



        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Daryl Tech & Educational Network. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.2em]">Accra · Ghana · West Africa</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
