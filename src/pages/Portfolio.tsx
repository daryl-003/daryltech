import { motion } from "framer-motion";
import { ExternalLink, Linkedin, Twitter, Github, Mail, Phone, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import AnimatedSplash from "@/components/AnimatedSplash";
import officeImg from "@/assets/office-workspace.jpg";
import ceoImg from "@/assets/ceo-darryl.jpg";

const ceoProjects = [
  {
    title: "Nexus E-Commerce Platform",
    category: "Web Development",
    desc: "Led the architecture and delivery of a full-stack e-commerce solution processing $2M+ monthly.",
    tech: ["React", "Node.js", "PostgreSQL", "Stripe"],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
  },
  {
    title: "FinEdge Trading Dashboard",
    category: "Data & Analytics",
    desc: "Personally oversaw the real-time data pipeline serving 10K+ concurrent traders.",
    tech: ["TypeScript", "D3.js", "WebSocket", "AWS"],
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
  },
  {
    title: "SmartFactory AI",
    category: "AI & Automation",
    desc: "Championed the company's first AI product — reducing factory defects by 35%.",
    tech: ["TensorFlow", "IoT", "Kubernetes"],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
  },
];

const companyProjects = [
  {
    title: "GreenPath Logistics App",
    category: "Mobile App",
    desc: "Cross-platform logistics management app with route optimization and real-time tracking.",
    tech: ["React Native", "Firebase", "Maps API"],
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop",
  },
  {
    title: "Pulse Health Portal",
    category: "Cloud & Healthcare",
    desc: "HIPAA-compliant patient portal with telemedicine, scheduling, and health records management.",
    tech: ["Next.js", "Azure", "HL7 FHIR"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
  },
  {
    title: "SecureVault Enterprise",
    category: "Cybersecurity",
    desc: "Enterprise security platform with threat detection, incident response, and compliance reporting.",
    tech: ["Python", "Elasticsearch", "Docker"],
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop",
  },
  {
    title: "EduStream LMS",
    category: "EdTech",
    desc: "Learning management system with live classes, progress tracking, and AI-driven course recommendations.",
    tech: ["React", "GraphQL", "AWS"],
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop",
  },
  {
    title: "UrbanPark Smart City",
    category: "IoT & Smart City",
    desc: "IoT sensor network for parking management across 200+ locations with mobile payment integration.",
    tech: ["IoT", "React Native", "Node.js"],
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop",
  },
  {
    title: "CryptoGuard Wallet",
    category: "FinTech & Blockchain",
    desc: "Multi-chain cryptocurrency wallet with DeFi integrations and institutional-grade security.",
    tech: ["Solidity", "React", "Web3.js"],
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop",
  },
];

const ProjectCard = ({ project, index }: { project: typeof companyProjects[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover-glow"
  >
    <div className="relative overflow-hidden">
      <img
        src={project.image}
        alt={project.title}
        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
      <span className="absolute bottom-3 left-3 rounded-md bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground">
        {project.category}
      </span>
    </div>
    <div className="p-6">
      <h3 className="mb-2 text-lg font-semibold">{project.title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{project.desc}</p>
      <div className="flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

const Portfolio = () => {
  return (
    <Layout>
      {/* Hero with background image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={officeImg} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        <AnimatedSplash intensity="soft" />
        <div className="container relative mx-auto px-6 py-28 md:py-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Portfolio</p>
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
              Our <span className="text-gradient">Best Work</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore a curated selection of projects — from CEO-led flagships to team-driven innovations across every industry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CEO Spotlight */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">CEO Spotlight</p>
            <h2 className="text-3xl font-bold md:text-4xl">Meet the Visionary</h2>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-3 items-start">
            {/* CEO Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="rounded-xl border border-border bg-background p-8 text-center hover-glow">
                <img
                  src={ceoImg}
                  alt="Darryl Thompson"
                  className="mx-auto mb-6 h-36 w-36 rounded-full object-cover border-4 border-primary/30"
                />
                <h3 className="text-2xl font-bold">Stephen Darryl Osei Boateng Junior</h3>
                <p className="mb-1 text-sm font-mono text-primary">Founder & CEO</p>
                <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                  5+ years in tech leadership. Former tech facilitator and developer at various institution & companies. Passionate about making enterprise-grade technology accessible to every business and youth with AI driven Tech Education.
                </p>

                {/* Contact Info */}
                <div className="mb-6 space-y-3 text-left">
                  <a href="mailto:darrylshub@gmail.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Mail size={15} className="text-primary" /> darrylshub@gmail.com
                  </a>
                  <a href="tel:+233550007171" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Phone size={15} className="text-primary" /> +233 (550) 007-171
                  </a>
                  <a href="https://darylstech.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Globe size={15} className="text-primary" /> darylstech.com
                  </a>
                </div>

                {/* Socials */}
                <div className="flex justify-center gap-3">
                  {[
                    { icon: Linkedin, href: "https://www.linkedin.com/company/daryl-tech-educational-network", label: "LinkedIn" },
                    { icon: Twitter, href: "https://x.com/daryl_tech?s=21", label: "Twitter" },
                    { icon: Github, href: "https://github.com/daryl-tech003", label: "GitHub" },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover-glow"
                    >
                      <s.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CEO Featured Projects */}
            <div className="lg:col-span-2">
              <h3 className="mb-6 text-lg font-semibold text-muted-foreground">
                Projects Led by <span className="text-foreground">Darryl & Team</span>
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {ceoProjects.map((project, i) => (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/50 hover-glow"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-24 w-24 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="mb-0.5 text-xs font-mono text-primary">{project.category}</p>
                      <h4 className="mb-1 text-sm font-semibold leading-snug">{project.title}</h4>
                      <p className="mb-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">{project.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.tech.slice(0, 3).map((t) => (
                          <span key={t} className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Projects */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">All Projects</p>
          <h2 className="text-3xl font-bold md:text-4xl">Team Delivered Projects</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            A showcase of solutions built by our talented engineering and design teams.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {companyProjects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Want to be our next <span className="text-gradient">success story</span>?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Let's build something remarkable together.
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Start a Project <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;
