import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, ArrowRight, ShieldCheck, Award, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ghanaVerifyImg from "@/assets/ghana-verification.jpg";

interface EnrollmentResult {
  enrollment_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  course: string;
  created_at: string;
  status: string;
}

interface CertificateResult {
  id: string;
  type: string;
  course: string;
  student_name: string;
  issued_date: string;
  issued_by: string;
  description: string | null;
}

const VerifyEnrollment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [enrollment, setEnrollment] = useState<EnrollmentResult | null>(null);
  const [certificates, setCertificates] = useState<CertificateResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", description: "You need to be logged in to verify enrollment.", variant: "destructive" });
        navigate("/auth?redirect=/courses/verify");
        return;
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, [navigate, toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchId.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setSearched(false);
    try {
      const { data: enrollData } = await supabase
        .from("enrollments")
        .select("enrollment_id, full_name, email, phone, course, created_at, status")
        .eq("enrollment_id", trimmed)
        .maybeSingle();
      setEnrollment(enrollData);
      const { data: certData } = await supabase
        .from("certificates")
        .select("id, type, course, student_name, issued_date, issued_by, description")
        .eq("enrollment_id", trimmed);
      setCertificates(certData || []);
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="relative border-b border-border">
        <div className="absolute inset-0">
          <img src={ghanaVerifyImg} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative mx-auto px-6 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <p className="mb-3 text-sm font-mono uppercase tracking-widest text-primary">
              <ShieldCheck className="mr-2 inline h-4 w-4" /> Verification
            </p>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Verify Your <span className="text-gradient">Enrollment</span></h1>
            <p className="text-muted-foreground">Enter your enrollment ID (DTEN- or DT-) to check your registration status and certificates.</p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-xl">
          <form onSubmit={handleVerify} className="mb-10 flex gap-3">
            <input required maxLength={20} value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="e.g. DTEN-A3B7X9K2"
              className="flex h-12 flex-1 rounded-lg border border-border bg-background px-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Verify
            </button>
          </form>

          {searched && enrollment && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="rounded-xl border border-primary/30 bg-card p-8 glow-border">
                <div className="mb-6 flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold">Enrollment Verified</h3>
                    <p className="text-sm text-muted-foreground">This enrollment is valid and active.</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  {[
                    ["Enrollment ID", <span className="font-mono font-semibold text-primary">{enrollment.enrollment_id}</span>],
                    ["Student Name", <span className="font-medium">{enrollment.full_name}</span>],
                    ["Email", <span className="font-medium">{enrollment.email}</span>],
                    ["Course", <span className="font-medium">{enrollment.course}</span>],
                    ["Enrolled On", <span className="font-medium">{new Date(enrollment.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>],
                  ].map(([label, value], i) => (
                    <div key={i} className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">{label}</span>{value}
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">{enrollment.status}</span>
                  </div>
                </div>
              </div>

              {certificates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><Award className="h-5 w-5 text-primary" /> Certificates & Letters</h3>
                  {certificates.map((cert) => (
                    <div key={cert.id} className="rounded-xl border border-border bg-card p-6">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">{cert.type}</span>
                        <span className="text-xs text-muted-foreground">{new Date(cert.issued_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <p className="mb-1 text-sm font-semibold">{cert.course}</p>
                      <p className="text-xs text-muted-foreground">Issued to: {cert.student_name}</p>
                      <p className="text-xs text-muted-foreground">Issued by: {cert.issued_by}</p>
                      {cert.description && <p className="mt-2 text-xs text-muted-foreground">{cert.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {searched && !enrollment && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/30 bg-card p-8 text-center"
            >
              <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h3 className="mb-2 text-lg font-bold">Enrollment Not Found</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                No enrollment matches "<span className="font-mono text-foreground">{searchId.trim().toUpperCase()}</span>".
              </p>
              <Link to="/courses/enroll" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Enroll Now <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default VerifyEnrollment;
