import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2, ArrowUpRight } from "lucide-react";
import { Facebook, Twitter, Linkedin, Instagram, Github } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSplash from "@/components/AnimatedSplash";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-training.jpg";
const contactInfo = [
  { icon: Mail, label: "Email", value: "daryltecheducationalnetwork@gmail.com", href: "mailto:daryltecheducationalnetwork@gmail.com" },
  { icon: Phone, label: "Phone", value: "+233 (509) 147-164", href: "tel:+233509147164" },
  { icon: MapPin, label: "Address", value: "Ablekuma, Accra - GHANA", href: null },
  { icon: Clock, label: "Business Hours", value: "Mon – Fri: 9:00 AM – 3:30 PM GMT", href: null },
];

const socials = [
  { icon: Facebook, href: "https://www.facebook.com/daryltecheducationalnetwork?mibextid=wwXIfr&mibextid=wwXIfr", label: "Facebook" },
  { icon: Twitter, href: "https://x.com/daryl_tech?s=21", label: "Twitter" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/daryl-tech-educational-network", label: "LinkedIn" },
  { icon: Instagram, href: "https://www.instagram.com/daryltech_official?igsh=dm42cmVtdG0wdGdn&utm_source=qr", label: "Instagram" },
  { icon: Github, href: "https://github.com/daryl-tech003", label: "GitHub" },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: dbError } = await supabase.from("contact_submissions").insert({
        name: form.name, email: form.email, subject: form.subject, message: form.message,
      });
      if (dbError) throw dbError;
      supabase.functions.invoke("send-notification", { body: { type: "contact", data: form } }).catch(console.error);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Cinematic Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        <AnimatedSplash intensity="medium" />
        <div className="container relative mx-auto px-6 py-28 md:py-36">
          <div className="grid gap-10 lg:grid-cols-12 items-end">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8">
              <p className="mb-3 text-sm font-mono uppercase tracking-widest text-primary">— Say hello</p>
              <h1 className="mb-6 text-5xl font-bold leading-[1.05] md:text-7xl">
                Let's start a <span className="text-gradient">conversation.</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Whether you have a defined project or a rough idea, our team responds within one business day.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-4">
              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-6">
                <p className="mb-1 text-xs font-mono uppercase tracking-widest text-primary">Response time</p>
                <p className="text-2xl font-bold">&lt; 24 to 48 hours</p>
                <p className="mt-2 text-sm text-muted-foreground">All inquiries reviewed by a senior engineer.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid gap-px bg-border overflow-hidden rounded-xl border border-border md:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item) => (
            <div key={item.label} className="group bg-background p-8 hover:bg-card transition-colors">
              <item.icon className="mb-4 h-6 w-6 text-primary" />
              <p className="mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="text-base font-medium hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  {item.value} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ) : (
                <p className="text-base font-medium">{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map split */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Send a message</p>
            <h2 className="mb-8 text-3xl font-bold md:text-4xl">Tell us about your project.</h2>

            {submitted ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <CheckCircle className="mx-auto mb-4 h-14 w-14 text-primary" />
                <h3 className="mb-2 text-2xl font-bold">Message Sent</h3>
                <p className="text-sm text-muted-foreground">We'll get back to you within 24 - 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-8">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                )}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                    <input type="text" name="name" required maxLength={100} value={form.name} onChange={handleChange} placeholder="DTEN" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email</label>
                    <input type="email" name="email" required maxLength={255} value={form.email} onChange={handleChange} placeholder="dten@company.com" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Subject</label>
                  <input type="text" name="subject" required maxLength={200} value={form.subject} onChange={handleChange} placeholder="How can we help?" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Message</label>
                  <textarea name="message" required rows={6} maxLength={2000} value={form.message} onChange={handleChange} placeholder="Tell us about your project or inquiry..." className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <>Send Message <Send size={16} /></>}
                </button>
              </form>
            )}
          </motion.div>

          <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="Daryls Tech Location"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15882.407142833892!2d-0.3186273!3d5.6256547!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdfa213a683a001%3A0x73f0536070c8ebcd!2sAblekuma%20curve!5e0!3m2!1sen!2sgh!4v1771543621952!5m2!1sen!2sgh"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              />
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="mb-4 text-sm font-mono uppercase tracking-widest text-primary">Follow Us</p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5">
                    <s.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
