import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSplash from "@/components/AnimatedSplash";
import { supabase } from "@/integrations/supabase/client";

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:30 PM"];
const serviceOptions = [
  "Web Development",
  "Mobile App Development",
  "Internship Inquiry",
  "Cloud Solutions",
  "Cybersecurity",
  "Data Analysis",
  "AI & Machine Learning",
  "IT Consulting",
  "Vulnerability Assessment",
  "General Inquiry",
  "Job Employment Inquiry",
  "Partnership",
];

const Booking = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: dbError } = await supabase.from("booking_submissions").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        service: form.service,
        preferred_date: form.date,
        preferred_time: form.time,
        message: form.message || null,
      });
      if (dbError) throw dbError;

      supabase.functions.invoke("send-notification", {
        body: {
          type: "booking",
          data: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            service: form.service,
            preferred_date: form.date,
            preferred_time: form.time,
            message: form.message,
          },
        },
      }).catch(console.error);

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <section className="container mx-auto flex min-h-[60vh] items-center justify-center px-6 py-24">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
            <CheckCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
            <h2 className="mb-4 text-3xl font-bold">Booking Confirmed!</h2>
            <p className="mb-2 text-muted-foreground">
              Thank you, <span className="text-foreground font-medium">{form.name}</span>. We've received your consultation request.
            </p>
            <p className="text-sm text-muted-foreground">
              Our team will reach out to <span className="text-foreground">{form.email}</span> within 24 - 48 hours to confirm your appointment.
            </p>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="relative container mx-auto px-6 py-24 overflow-hidden">
        <AnimatedSplash intensity="soft" className="-z-10" />
        <div className="grid gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Book a Call</p>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              Let's <span className="text-gradient">Talk</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              Schedule a free 30-minute consultation with our team. We'll discuss your project, explore solutions, and create a roadmap tailored to your needs.
            </p>
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-2 text-sm font-semibold">What to Expect</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="mt-0.5 text-primary shrink-0" /> Discovery call to understand your goals</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="mt-0.5 text-primary shrink-0" /> Technical feasibility assessment</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="mt-0.5 text-primary shrink-0" /> Timeline and cost estimation</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="mt-0.5 text-primary shrink-0" /> No obligation — completely free</li>
                </ul>
              </div>

              {/* Google Form Embed */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 text-sm font-semibold">Or Book via Google Form</h3>
                <div className="overflow-hidden rounded-lg border border-border">
                  <a
    href="https://docs.google.com/forms/d/e/1FAIpQLSflhJFOORGufdT4fhFj9vsllffOAmWsKRPUATXJtFZcno5wqA/viewform?usp=publish-editor"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
  >
    Open Google Form
  </a>
  <p className="mt-3 text-xs text-muted-foreground">
    Note: Booking  via Google Form will be processed within 24 to 48 hours. You'll receive your enrollment ID via email.
  </p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Prefer Google Forms? Submit your booking request above.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-8">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium"><User size={14} className="text-primary" /> Full Name</label>
                <input type="text" name="name" required value={form.name} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="John Doe" />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium"><Mail size={14} className="text-primary" /> Email</label>
                  <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium"><Phone size={14} className="text-primary" /> Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="+1 (234) 567-890" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium"><MessageSquare size={14} className="text-primary" /> Service Interest</label>
                <select name="service" required value={form.service} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Select a service</option>
                  {serviceOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium"><Calendar size={14} className="text-primary" /> Preferred Date</label>
                  <input type="date" name="date" required value={form.date} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium"><Clock size={14} className="text-primary" /> Preferred Time</label>
                  <select name="time" required value={form.time} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select a time</option>
                    {timeSlots.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 text-sm font-medium">Additional Details</label>
                <textarea name="message" rows={3} value={form.message} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Tell us about your project..." />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Book Consultation"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Booking;
