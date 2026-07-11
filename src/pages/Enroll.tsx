import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, ClipboardCopy, BookOpen, Upload, FileText, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ghanaEnrollmentImg from "@/assets/ghana-enrollment.jpg";

const generateEnrollmentId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "DTEN-";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const Enroll = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [paidAmount, setPaidAmount] = useState<string | null>(null);
  const [paidCourse, setPaidCourse] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    course: "",
  });

 const courses = [
    "Full-Stack Web Development",
    "Mobile App Development",
    "Cloud Engineering & DevOps",
    "Cybersecurity Fundamentals",
    "AI & Machine Learning",
    "IT Support & Administration",
    "Data Science Analytics",
    "Introduction to Linux",
    "Introduction to Python",
    "Introduction to React, TypeScript and JavaScript",
    "Database Management & Management Systems",
    "Introduction to Excel",
    "Networking and Systems Administration"
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", description: "You need to be logged in to enroll in a course.", variant: "destructive" });
        navigate("/auth?redirect=/courses/enroll");
        return;
      }
      // Pre-fill email from session
      setForm(f => ({ ...f, email: session.user.email || "" }));
      setCheckingAuth(false);

      // Verify Paystack payment if returning from checkout
      const reference = searchParams.get("reference") || searchParams.get("trxref");
      const paymentFlag = searchParams.get("payment");
      if (paymentFlag === "success" && reference) {
        setVerifyingPayment(true);
        try {
          const { data, error } = await supabase.functions.invoke("verify-payment", { body: { reference } });
          if (error) throw error;
          if (!data?.verified) {
            toast({ title: "Payment not verified", description: data?.message || "Please contact support.", variant: "destructive" });
          } else {
            setEnrollmentId(data.enrollment_id);
            setPaidCourse(data.course);
            setPaidAmount(Number(data.amount_ghs).toFixed(2));
            setForm(f => ({ ...f, course: data.course }));
            setEnrolled(true);
            toast({ title: "Payment confirmed", description: "Your enrollment is active." });
          }
        } catch (err: any) {
          toast({ title: "Verification failed", description: err.message, variant: "destructive" });
        } finally {
          setVerifyingPayment(false);
        }
      }
    };
    checkAuth();
  }, [navigate, toast, searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("CV file must be under 5MB."); return; }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { setError("Only PDF, DOC, and DOCX files are accepted."); return; }
    setError("");
    setCvFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const id = generateEnrollmentId();
      let cvUrl: string | null = null;
      if (cvFile) {
        const ext = cvFile.name.split(".").pop();
        const path = `${id}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("student-cvs").upload(path, cvFile, { upsert: true });
        if (uploadError) throw uploadError;
        cvUrl = path;
      }
      const { error: dbError } = await supabase.from("enrollments").insert({
        enrollment_id: id, full_name: form.fullName, email: form.email,
        phone: form.phone || null, course: form.course, cv_url: cvUrl, source: "website",
      });
      if (dbError) throw dbError;
      supabase.functions.invoke("send-notification", {
        body: { type: "enrollment", data: { enrollment_id: id, full_name: form.fullName, email: form.email, phone: form.phone, course: form.course, cv_url: cvUrl || "" } },
      }).catch(console.error);
      setEnrollmentId(id);
      setEnrolled(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const copyId = () => {
    navigator.clipboard.writeText(enrollmentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (checkingAuth || verifyingPayment) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {verifyingPayment && <p className="text-sm text-muted-foreground">Verifying your Paystack payment…</p>}
        </div>
      </Layout>
    );
  }

  if (enrolled) {
    return (
      <Layout>
        <section className="container mx-auto px-6 py-32">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-lg rounded-xl border border-primary/30 bg-card p-10 text-center glow-border"
          >
            <CheckCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
            <h2 className="mb-2 text-2xl font-bold">{paidAmount ? "Payment Confirmed!" : "Enrollment Successful!"}</h2>
            <p className="mb-6 text-muted-foreground">You have been enrolled in <strong className="text-foreground">{paidCourse || form.course}</strong>{paidAmount && <> — paid <strong className="text-foreground">GH₵{paidAmount}</strong></>}.</p>
            <div className="mb-6 rounded-lg border border-border bg-background p-4">
              <p className="mb-1 text-xs text-muted-foreground uppercase tracking-wider">Your Enrollment ID</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-bold text-gradient">{enrollmentId}</span>
                <button onClick={copyId} className="text-muted-foreground hover:text-primary transition-colors"><ClipboardCopy size={18} /></button>
              </div>
              {copied && <p className="mt-1 text-xs text-primary">Copied!</p>}
            </div>
            <p className="mb-8 text-sm text-muted-foreground">Save this ID — you'll need it to verify your enrollment status.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/courses/verify" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">Verify Enrollment</Link>
              <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">Browse Courses <ArrowRight size={16} /></Link>
            </div>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="relative border-b border-border">
        <div className="absolute inset-0">
          <img src={ghanaEnrollmentImg} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative mx-auto px-6 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <p className="mb-3 text-sm font-mono uppercase tracking-widest text-primary"><BookOpen className="mr-2 inline h-4 w-4" /> Enrollment</p>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Enroll in a <span className="text-gradient">Course</span></h1>
            <p className="text-muted-foreground">Fill out the form below or use our Google Form to complete your enrollment.</p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="mb-6 text-2xl font-bold">Quick Enrollment</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
                <input required maxLength={100} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Daryls Tech" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input required type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="john@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
                <input required type="tel" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="+233 (209) 344-249" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Select Course</label>
                <select required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Choose a course...</option>
                  {courses.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Upload CV (optional)</label>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {cvFile ? (
                    <><FileText size={16} className="text-primary" /><span className="truncate text-foreground">{cvFile.name}</span><span className="ml-auto text-xs">({(cvFile.size / 1024 / 1024).toFixed(1)} MB)</span></>
                  ) : (
                    <><Upload size={16} /><span>Click to upload PDF, DOC, or DOCX (max 5MB)</span></>
                  )}
                </button>
              </div>
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <>Submit Enrollment <ArrowRight size={16} /></>}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="mb-6 text-2xl font-bold">Enroll via Google Form</h2>
            <p className="mb-4 text-sm text-muted-foreground">Prefer using Google Forms? Complete your enrollment below.</p>
            <a
    href="https://docs.google.com/forms/d/e/1FAIpQLSd49u8voUFuJRFRCBAYo3aI25RTw80F_zHyGI_vuN0AVmlyGw/viewform"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
  >
    Open Google Form
  </a>
            <p className="mt-3 text-xs text-muted-foreground">Note: Enrollments via Google Form will be processed within 24 - 48 hours.</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Enroll;
