import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Code, Cloud, Shield, Smartphone, Brain, Monitor, Database, Headphones, ArrowRight, Star, ArrowUpRight } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSplash from "@/components/AnimatedSplash";
import heroImg from "@/assets/hero-datacenter.jpg";
import sectionImg from "@/assets/section-network.jpg";

const services = [
  { icon: Code, title: "Web Development", desc: "Full-stack platforms in React, Node.js, and modern frameworks — from landing pages to enterprise systems.", tag: "01" },
  { icon: Smartphone, title: "Mobile Applications", desc: "iOS and Android apps built with React Native and Flutter. Seamless cross-platform experiences.", tag: "02" },
  { icon: Cloud, title: "Cloud Solutions", desc: "AWS, Azure, and GCP setup, migration, and optimization for scalable cloud architectures.", tag: "03" },
  { icon: Shield, title: "Cybersecurity", desc: "Penetration testing, compliance auditing, and hardened security for your digital assets.", tag: "04" },
  { icon: Brain, title: "AI & Machine Learning", desc: "Custom models, chatbots, and automation workflows that turn data into decisions.", tag: "05" },
  { icon: Monitor, title: "IT Consulting", desc: "Strategic technology planning and digital transformation roadmaps.", tag: "06" },
  { icon: Database, title: "Data Engineering", desc: "Pipelines, warehousing, and real-time analytics platforms.", tag: "07" },
  { icon: Headphones, title: "Managed IT Services", desc: "24/7 monitoring, maintenance, helpdesk, and proactive IT management.", tag: "08" },
];

const industries = ["Finance", "Healthcare", "Education", "Logistics", "Retail", "Public Sector", "Startups", "Manufacturing"];

const testimonials = [
  { name: "Sarah Mitchell", role: "CEO, Nexus Retail", text: "Daryl Tech transformed our entire e-commerce platform. Revenue increased 40% within three months of launch.", rating: 5 },
  { name: "James Rodriguez", role: "CTO, FinEdge Capital", text: "Their cybersecurity audit uncovered critical vulnerabilities we hadn't seen. Professional, thorough, and fast.", rating: 5 },
  { name: "Amara Johnson", role: "Founder, GreenPath Logistics", text: "The custom logistics dashboard they built saves our team 20 hours per week. Incredible ROI.", rating: 5 },
  { name: "David Chen", role: "VP Engineering, Pulse Health", text: "Moving to the cloud with Daryl Tech was seamless. Zero downtime migration — exactly what we needed.", rating: 5 },
];

const Services = () => {
  return (
    <Layout>
      {/* Cinematic Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        <AnimatedSplash intensity="medium" />
        <div className="container relative mx-auto px-6 py-28 md:py-40">
          <div className="grid gap-12 lg:grid-cols-12 items-end">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8">
              <p className="mb-3 text-sm font-mono uppercase tracking-widest text-primary">— What we do</p>
              <h1 className="mb-6 text-5xl font-bold leading-[1.05] md:text-7xl">
                End-to-end <span className="text-gradient">technology</span> for businesses that build.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Eight specialized practices. One integrated team. We ship production-grade software, cloud, and AI for organisations across Africa and beyond.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-4">
              <div className="flex flex-wrap gap-3">
                <Link to="/booking" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
                  Start a project <ArrowRight size={16} />
                </Link>
                <Link to="/portfolio" className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-colors">
                  See our work
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industries marquee */}
      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="text-primary">Industries →</span>
            {industries.map((i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid — editorial */}
      <section className="container mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 max-w-2xl">
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Our practices</p>
          <h2 className="text-3xl font-bold md:text-4xl">Eight disciplines, one delivery team.</h2>
        </motion.div>

        <div className="grid gap-px bg-border overflow-hidden rounded-xl border border-border">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group relative bg-background p-8 transition-all hover:bg-card md:col-span-1"
              style={{ gridColumn: `span 1 / span 1` }}
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-xs font-mono text-muted-foreground">{service.tag}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
              </div>
              <service.icon className="mb-6 h-8 w-8 text-primary" />
              <h3 className="mb-3 text-xl font-semibold group-hover:text-primary transition-colors">{service.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{service.desc}</p>
            </motion.div>
          ))}
        </div>
        <style>{`@media (min-width: 768px){.container .grid.gap-px{grid-template-columns:repeat(2,1fr)}}@media (min-width:1024px){.container .grid.gap-px{grid-template-columns:repeat(4,1fr)}}`}</style>
      </section>

      {/* Split process feature */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img src={sectionImg} alt="Network operations" className="rounded-xl border border-border w-full h-[420px] object-cover" loading="lazy" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">How we work</p>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">A disciplined process — from brief to launch.</h2>
              <div className="space-y-6">
                {[
                  { n: "01", t: "Discovery", d: "We map the problem, users, and success metrics before writing a line of code." },
                  { n: "02", t: "Design & architecture", d: "Prototypes, systems diagrams, and scoped roadmaps you can trust." },
                  { n: "03", t: "Build in sprints", d: "Two-week increments with demos, so you see progress every step." },
                  { n: "04", t: "Ship & support", d: "Deploy on your infrastructure, monitor, iterate. We stick around." },
                ].map((step) => (
                  <div key={step.n} className="flex gap-5 border-b border-border pb-5 last:border-0">
                    <span className="text-xs font-mono text-primary shrink-0 pt-1">{step.n}</span>
                    <div>
                      <h4 className="mb-1 font-semibold">{step.t}</h4>
                      <p className="text-sm text-muted-foreground">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 max-w-2xl">
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Client voices</p>
          <h2 className="text-3xl font-bold md:text-4xl">Trusted by teams shipping real work.</h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-8 hover:border-primary/40 transition-all"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-6 text-base leading-relaxed">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-6 py-24 text-center">
          <h2 className="mx-auto mb-6 max-w-2xl text-4xl font-bold md:text-5xl">
            Have a project in mind? <span className="text-gradient">Let's build it.</span>
          </h2>
          <Link to="/booking" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
            Book a free consultation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
