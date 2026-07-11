import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, GraduationCap, Users, CheckCircle2, LogIn, Award, Handshake, Sparkles, Loader2, Send Code, Cloud, Shield, Brain, Smartphone, Monitor, LogIn, Briefcase, CreditCard, Loader2, Award, CheckCircle, Heart, FileSpreadsheet, Flag} from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSplash from "@/components/AnimatedSplash";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import teamCollab from "@/assets/team-collab.jpg";
import ghanaStudentsImg from "@/assets/ghana-students-lab.jpg";

const applicationSchema = z.object({
  full_name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  track: z.string().min(1, "Select a track"),
  experience_level: z.string().min(1, "Select experience level"),
  portfolio_url: z.string().trim().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  motivation: z.string().trim().min(20, "Tell us a bit more (min 20 chars)").max(1500),
});

const tracks = [
  { 
    icon: Briefcase, 
    title: "Web Development", 
    duration: "3–6 months", 
    slots: "12 slots / cohort", 
    desc: "Ship production features in a real team. React, Node, Postgres, CI/CD." 
  },
  { 
    icon: Sparkles, 
    title: "AI & Data", 
    duration: "3 months", 
    slots: "8 slots / cohort", 
    desc: "Build LLM-powered tools, dashboards and data pipelines with mentors." 
  },
  { 
    icon: Building2, 
    title: "Cloud & DevOps", 
    duration: "4 months", 
    slots: "6 slots / cohort", 
    desc: "AWS/Azure, Docker, Kubernetes and infrastructure automation on live workloads." 
  },
  { 
    icon: Award, 
    title: "Cybersecurity", 
    duration: "3 months", 
    slots: "Unlimited", 
    desc: "Blue-team ops, pen-testing labs and compliance auditing under senior guidance." 
  },
  {
    icon: Code,
    title: "Web Development",
    duration: "3–6 months",
    slots: "12 slots / cohort",
    desc: "Learn HTML, CSS, JavaScript, TypeScript, React, Node.js, Express, databases, Git, APIs, and deployment by building production-ready web applications."
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    duration: "3 months",
    slots: "10 slots / cohort",
    desc: "Develop Android and iOS applications using React Native and Flutter while working on real-world mobile projects."
  },
  {
    icon: Brain,
    title: "AI & Data Science",
    duration: "4 months",
    slots: "8 slots / cohort",
    desc: "Master Python, Data Science, Machine Learning, PyTorch, Kaggle, JupyterLab, Google Colab, and Azure ML through practical projects."
  },
  {
    icon: Cloud,
    title: "Cloud Engineering & DevOps",
    duration: "4 months",
    slots: "6 slots / cohort",
    desc: "Gain hands-on experience with AWS, Azure, Docker, Kubernetes, CI/CD pipelines, Infrastructure as Code, and cloud deployment."
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    duration: "3 months",
    slots: "8 slots / cohort",
    desc: "Learn ethical hacking, penetration testing, network security, digital forensics, and compliance through practical security labs."
  },
  {
    icon: Monitor,
    title: "Networking & IT Support",
    duration: "3 months",
    slots: "10 slots / cohort",
    desc: "Study networking fundamentals, system administration, troubleshooting, Windows & Linux administration, and enterprise IT support."
  },
  {
    icon: FileSpreadsheet,
    title: "Database & Data Analytics",
    duration: "2–3 months",
    slots: "10 slots / cohort",
    desc: "Learn SQL, database management systems, Microsoft Excel, data visualization, and business analytics for real-world decision making."
  },
  {
    icon: Heart,
    title: "Linux & Open Source",
    duration: "2 months",
    slots: "12 slots / cohort",
    desc: "Master Linux fundamentals, Ubuntu, Debian, virtualization with VMware & VirtualBox, shell scripting, and open-source development."
  },
  {
    icon: Flag,
    title: "Python Programming",
    duration: "2 months",
    slots: "12 slots / cohort",
    desc: "Build a solid programming foundation using Python, covering automation, scripting, APIs, object-oriented programming, and real-world projects."
  },
  {
    icon: Award,
    title: "Frontend Development",
    duration: "3 months",
    slots: "12 slots / cohort",
    desc: "Learn React, TypeScript, JavaScript, responsive design, state management, and modern frontend development best practices."
  }
];

const steps = [
  { n: "01", t: "Apply", d: "Create an account and submit your internship application." },
  { n: "02", t: "Interview", d: "Short technical + behavioural interview with our team." },
  { n: "03", t: "Onboard", d: "Meet your mentor, get provisioned, join a live project." },
  { n: "04", t: "Ship & graduate", d: "Deliver features, earn your certificate, get placed." },
];

const Internships = () => {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAuthed(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => subscription.unsubscribe();
  }, []);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    track: "",
    experience_level: "",
    portfolio_url: "",
    motivation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const payload = {
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      track: parsed.data.track,
      experience_level: parsed.data.experience_level,
      motivation: parsed.data.motivation,
      phone: parsed.data.phone || null,
      portfolio_url: parsed.data.portfolio_url || null,
    };
    const { error } = await supabase.from("internship_applications").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Something went wrong. Try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Application received! We'll be in touch.");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img src={teamCollab} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        </div>
        <AnimatedSplash intensity="soft" />
        <div className="container relative mx-auto px-6 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="mb-3 text-sm font-mono uppercase tracking-widest text-primary">
              <Briefcase className="mr-2 inline h-4 w-4" /> Internships
            </p>
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
              Launch your career with a <span className="text-gradient">real internship</span>.
            </h1>
            <p className="mb-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Structured programs across engineering, AI, cloud and security — with paid stipends, mentorship, and a clear path to full-time employment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="#apply" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
                {authed ? "Apply Now" : (<><LogIn size={16} /> Sign in to Apply</>)} <ArrowRight size={16} />
              </Link>
              <Link to="/booking" className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-semibold hover:border-primary hover:text-primary">
                Talk to Admissions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tracks */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Programs</p>
          <h2 className="text-3xl font-bold md:text-4xl">Internship <span className="text-gradient">tracks</span></h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tracks.map((t, i) => (
            <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <t.icon className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">{t.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{t.desc}</p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-wider text-primary/80">
                <span className="rounded-full border border-primary/30 px-2 py-0.5">{t.duration}</span>
                <span className="rounded-full border border-primary/30 px-2 py-0.5">{t.slots}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Why intern with us</p>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">More than an internship — a <span className="text-gradient">career springboard</span>.</h2>
              <ul className="space-y-4">
                {benefits.map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <div className="font-semibold">{b.title}</div>
                      <div className="text-sm text-muted-foreground">{b.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <img src={ghanaStudentsImg} alt="Interns at Daryl Tech" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">How it works</p>
          <h2 className="text-3xl font-bold md:text-4xl">From application to <span className="text-gradient">first shipped feature</span></h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-3 text-xs font-mono text-primary">{s.n}</div>
              <div className="font-semibold">{s.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="border-t border-border bg-card/40">
        <div className="container mx-auto px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Apply</p>
              <h2 className="text-3xl font-bold md:text-4xl">Submit your <span className="text-gradient">application</span></h2>
              <p className="mt-3 text-muted-foreground">Fill out the form and our admissions team will reach out within 3–5 days.</p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-primary/40 bg-card p-10 text-center"
              >
                <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-primary" />
                <h3 className="mb-2 text-2xl font-semibold">Application received!</h3>
                <p className="mx-auto max-w-md text-muted-foreground">
                  Thanks {form.full_name.split(" ")[0]}. We've logged your application for the <span className="text-primary">{form.track}</span> track and will follow up at <span className="text-primary">{form.email}</span>.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Full name *</label>
                    <input required maxLength={100} value={form.full_name} onChange={update("full_name")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email *</label>
                    <input required type="email" maxLength={255} value={form.email} onChange={update("email")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Phone</label>
                    <input maxLength={30} value={form.phone} onChange={update("phone")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Portfolio / LinkedIn URL</label>
                    <input type="url" maxLength={500} value={form.portfolio_url} onChange={update("portfolio_url")} placeholder="https://…"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Track *</label>
                    <select required value={form.track} onChange={update("track")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Select a track…</option>
                      {tracks.map((t) => <option key={t.title} value={t.title}>{t.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Experience level *</label>
                    <select required value={form.experience_level} onChange={update("experience_level")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Select level…</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Why do you want this internship? *</label>
                  <textarea required minLength={20} maxLength={1500} rows={5} value={form.motivation} onChange={update("motivation")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <button type="submit" disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60">
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><Send size={16} /> Submit Application</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="border-t border-border bg-background">
        <div className="container mx-auto px-6 py-20 text-center">
          <Briefcase className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="mb-4 text-3xl font-bold">Ready to <span className="text-gradient">get placed</span>?</h2>
          <p className="mx-auto mb-8 max-w-lg text-muted-foreground">Applications open on a rolling basis. Sign in or create an account to submit your application.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="#apply" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:scale-105 transition-transform">
              Apply Now <ArrowRight size={16} />
            </Link>
            <Link to="/courses" className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-semibold hover:border-primary hover:text-primary">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Internships;
