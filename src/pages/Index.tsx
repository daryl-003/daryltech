import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowRight, Code, Cloud, Shield, Smartphone, Brain, Monitor,
  GraduationCap, Briefcase, Quote, Plus, Star, Calendar, Clock, FileSpreadsheet,
} from "lucide-react";
import Layout from "@/components/Layout";
import NewsletterForm from "@/components/NewsletterForm";
import { supabase } from "@/integrations/supabase/client";
import heroDC from "@/assets/hero-datacenter.jpg";
import heroTraining from "@/assets/hero-training.jpg";
import sectionNet from "@/assets/section-network.jpg";
import aiTech from "@/assets/ai-tech.jpg";
import teamCollab from "@/assets/team-collab.jpg";

const expertise = [
  { icon: Code, title: "Web & App Development", desc: "Production-grade web platforms and mobile apps engineered for performance, scale and security.", href: "/services" },
  { icon: Cloud, title: "Cloud & Infrastructure", desc: "Scalable cloud architecture, migration and hybrid infrastructure aligned to your roadmap.", href: "/services" },
  { icon: GraduationCap, title: "Tech Training Academy", desc: "Career-ready certifications in software engineering, AI, cloud and cybersecurity for the next generation.", href: "/courses" },
  { icon: Shield, title: "Cybersecurity", desc: "Enterprise-grade protection, audits and continuous monitoring to keep your business safe.", href: "/services" },
  { icon: Brain, title: "AI & Automation", desc: "Smart workflows and machine learning solutions that turn data into measurable advantage.", href: "/services" },
  { icon: Monitor, title: "IT Consulting", desc: "Strategic advisory and technology roadmaps from a team that has shipped real systems.", href: "/services" },
];

const stats = [
  { value: "100+", label: "Projects Delivered" },
  { value: "2K+", label: "Students Trained" },
  { value: "5+", label: "Years Experience" },
  { value: "50+", label: "Happy Clients" },
  { value: "80%", label: "Uptime Guaranteed" },
];

const testimonials = [
  { quote: "Daryl Tech transformed our infrastructure. Their team is responsive, knowledgeable and relentless about quality.", name: "Jeffery Stillman", role: "Operations Lead" },
  { quote: "Enrolling in the academy was one of the best career decisions I made. Hands-on, real-world, taught by professionals.", name: "Daria Anderson.", role: "Web Developer" },
  { quote: "Their cybersecurity work is best-in-class. Proactive, structured, and built around real threat models.", name: "Danny Glover", role: "Cybersecurity Specialist " },
];

const Index = () => {
  const [latestPosts, setLatestPosts] = useState<Array<{ id: string; title: string; excerpt: string; category: string; image_url: string | null; read_time: string; created_at: string }>>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, excerpt, category, image_url, read_time, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => { if (data) setLatestPosts(data); });
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Layout fullBleed>
      {/* HERO — cinematic, full-bleed */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroDC}
            alt="Data centre and hybrid infrastructure"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-20 pt-32 md:px-12 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <p className="mb-6 text-xs font-mono uppercase tracking-[0.4em] text-primary">
              Technology · Education · Innovation
            </p>
            <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-[8rem]">
              Building the<br />
              <span className="text-gradient">Future</span> of Tech.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Comprehensive digital solutions tailored to optimise your business, blending cutting-edge engineering with world-class education for the next generation of African tech leaders.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/booking"
                className="group inline-flex items-center gap-3 rounded-full bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Start a Project
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/courses"
                className="group inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/30 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary"
              >
                Explore Academy
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <div className="mt-12 hidden items-end justify-between gap-6 md:flex">
            <p className="max-w-xs text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
              [ Scroll to explore ]
            </p>
            <div className="flex flex-wrap gap-x-12 gap-y-4">
              {stats.map((s) => (
                <div key={s.label} className="text-right">
                  <div className="text-2xl font-bold text-gradient md:text-3xl">{s.value}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTERNSHIPS spotlight — prominent */}
      <section className="relative overflow-hidden border-y border-border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr] md:px-12 md:py-20">
          <div>
            <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.4em] text-primary">
              <Briefcase className="mr-2 inline h-3.5 w-3.5" /> // Now Recruiting — Fall Cohort
            </p>
            <h2 className="text-3xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              Free & Paid <span className="text-gradient">Internships</span> at Daryls Tech — apply today.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              Work on live projects with senior mentors across Engineering, AI, Cloud and Security. Stipend, certificate, and a real path to full-time offers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/internships" className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">
                Explore Internships <ArrowUpRight size={14} />
              </Link>
              <Link to="/courses/enroll" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
                Apply Now
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            {[
              { n: "4", l: "Tracks" },
              { n: "32", l: "Slots / Cohort" },
              { n: "3–6mo", l: "Duration" },
              { n: "90%", l: "Placement Rate" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-primary/20 bg-card/60 p-5 backdrop-blur">
                <div className="text-3xl font-bold text-gradient">{s.n}</div>
                <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS marquee strip */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-[1600px] px-6 py-10 md:px-12">
          <p className="mb-6 text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">
            // Trusted by partners across Ghana &amp; West Africa
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 opacity-70">
            {["Nanasei & Associates", "Vodafone", "PenelGroup", "Hubtel", "CalBank", "GT Bank", "Zeepay"].map((name) => (
              <span key={name} className="font-mono text-xl font-bold tracking-tight text-foreground/60 md:text-2xl">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTISE — IPMC-style card grid */}
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-[1600px] px-6 md:px-12">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.4em] text-primary">
                / Our Areas of Expertise
              </p>
              <h2 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Customer-based digital solutions for your company.
              </h2>
            </div>
            <Link to="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              View all services <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {expertise.map((e, i) => (
              <motion.div
                key={e.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Link
                  to={e.href}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary hover:bg-card/60 hover-glow"
                >
                  <div>
                    <div className="mb-8 flex items-center justify-between">
                      <e.icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
                      <Plus className="h-5 w-5 rotate-0 text-muted-foreground transition-all group-hover:rotate-45 group-hover:text-primary" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold leading-tight md:text-2xl">{e.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                  </div>
                  <div className="mt-10 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Learn more <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT — Academy showcase */}
      <section className="relative overflow-hidden bg-card/30">
        <div className="mx-auto grid max-w-[1600px] gap-0 px-0 md:grid-cols-2">
          <div className="relative min-h-[500px] overflow-hidden">
            <img
              src={heroTraining}
              alt="Students learning at Daryl Tech academy"
              className="h-full w-full object-cover"
              loading="lazy"
              width={1600}
              height={1200}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/30" />
          </div>
          <div className="flex flex-col justify-center px-6 py-20 md:px-16 md:py-24">
            <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.4em] text-primary">// Daryl Tech Academy</p>
            <h2 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              Launch your <span className="text-gradient">tech career</span> with real-world training.
            </h2>
            <p className="mb-8 max-w-lg text-muted-foreground leading-relaxed">
              Industry-leading courses in web development, AI, cloud engineering and cybersecurity — taught by professionals shipping in production. Hands-on projects, certificates and internship pathways included.
            </p>
            <div className="mb-10 grid grid-cols-2 gap-4 md:gap-6">
              {[
                { num: "12+", label: "Certified Courses" },
                { num: "2K+", label: "Students Enrolled" },
                { num: "95%", label: "Completion Rate" },
                { num: "4.2", label: "Avg. Rating" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                  <div className="text-2xl font-bold text-gradient">{s.num}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/courses" className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">
                Browse Courses <ArrowUpRight size={14} />
              </Link>
              <Link to="/courses/enroll" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COLLABORATE — large bold pull section */}
      <section className="relative overflow-hidden border-y border-border bg-background py-24 md:py-32">
        <div className="absolute inset-0 opacity-20">
          <img src={sectionNet} alt="" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background" />
        </div>
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.4em] text-primary">// Collaborate with us</p>
              <h2 className="text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                Together, we'll build the <span className="text-gradient">future</span>.
              </h2>
              <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">
                We believe in the power of collaboration to drive innovation. Whether you're enhancing efficiency, streamlining processes or embracing new technologies — we partner with you end to end with a shared commitment to excellence.
              </p>
              <Link to="/contact" className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">
                Contact Us <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-2xl border border-border">
                <img src={aiTech} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-border">
                <img src={teamCollab} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="col-span-2 rounded-2xl border border-primary/30 bg-card p-6 glow-border">
                <Briefcase className="mb-3 h-7 w-7 text-primary" />
                <h3 className="text-lg font-semibold">Apply for an Internship</h3>
                <p className="mt-2 text-sm text-muted-foreground">Work on live projects alongside industry professionals.</p>
                <Link to="/courses/enroll" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  Apply now <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-[1600px] px-6 md:px-12">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.4em] text-primary">// Honest Reviews</p>
              <h2 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                What our clients & students say.
              </h2>
            </div>
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              <span className="ml-2 text-sm text-muted-foreground">4.0 average rating</span>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <Quote className="mb-4 h-6 w-6 text-primary" />
                <p className="mb-6 text-base leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST JOURNAL */}
      {latestPosts.length > 0 && (
        <section className="border-t border-border bg-background py-24 md:py-28">
          <div className="mx-auto max-w-[1600px] px-6 md:px-12">
            <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.4em] text-primary">// From the Journal</p>
                <h2 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                  Latest stories & <span className="text-gradient">field notes</span>.
                </h2>
              </div>
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                View all posts <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {latestPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/blog/${post.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/60"
                  >
                    {post.image_url && (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-primary">{post.category}</p>
                      <h3 className="mb-3 text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="mb-5 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.created_at)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.read_time}</span>
                        <ArrowUpRight size={14} className="ml-auto text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* NEWSLETTER */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-[1600px] px-6 py-20 md:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.4em] text-primary">// Stay updated</p>
              <h2 className="text-3xl font-bold leading-tight md:text-5xl">
                Featured trends, insights, and <span className="text-gradient">stories</span> straight to your inbox.
              </h2>
            </div>
            <div>
              <NewsletterForm />
              <p className="mt-4 text-xs text-muted-foreground">No spam. Unsubscribe any time.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
