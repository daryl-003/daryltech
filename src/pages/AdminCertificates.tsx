import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Search, Plus, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const certTypes = ["Certificate of Completion", "Letter of Recommendation", "Certificate of Excellence"];

const AdminCertificates = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Enrollment lookup
  const [searchId, setSearchId] = useState("");
  const [enrollment, setEnrollment] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Certificate form
  const [form, setForm] = useState({
    type: "",
    description: "",
  });

  // Existing certificates for the enrollment
  const [existingCerts, setExistingCerts] = useState<any[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleData) {
        navigate("/");
        return;
      }
      setIsAdmin(true);
      setAuthChecked(true);
    };
    checkAdmin();
  }, [navigate]);

  const lookupEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchId.trim().toUpperCase();
    if (!trimmed) return;
    setSearching(true);
    setEnrollment(null);
    setExistingCerts([]);
    setSuccess("");
    setError("");

    const { data: enrollData } = await supabase
      .from("enrollments")
      .select("*")
      .eq("enrollment_id", trimmed)
      .maybeSingle();

    if (enrollData) {
      setEnrollment(enrollData);
      const { data: certs } = await supabase
        .from("certificates")
        .select("*")
        .eq("enrollment_id", trimmed)
        .order("created_at", { ascending: false });
      setExistingCerts(certs || []);
    } else {
      setError("No enrollment found with that ID.");
    }
    setSearching(false);
  };

  const issueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: dbError } = await supabase.from("certificates").insert({
        enrollment_id: enrollment.enrollment_id,
        student_name: enrollment.full_name,
        course: enrollment.course,
        type: form.type,
        description: form.description || null,
      });
      if (dbError) throw dbError;

      setSuccess(`${form.type} issued to ${enrollment.full_name}!`);
      setForm({ type: "", description: "" });

      // Refresh certs list
      const { data: certs } = await supabase
        .from("certificates")
        .select("*")
        .eq("enrollment_id", enrollment.enrollment_id)
        .order("created_at", { ascending: false });
      setExistingCerts(certs || []);
    } catch (err: any) {
      setError(err.message || "Failed to issue certificate.");
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  return (
    <Layout>
      <section className="container mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Admin Panel</p>
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            Issue <span className="text-gradient">Certificates</span>
          </h1>
          <p className="text-muted-foreground">Search for a student by enrollment ID, then issue certificates or letters of recommendation.</p>
        </motion.div>

        {/* Enrollment Lookup */}
        <div className="mx-auto max-w-2xl space-y-8">
          <form onSubmit={lookupEnrollment} className="flex gap-3">
            <input
              required
              maxLength={20}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Enrollment ID (e.g. DTEN-A3B7X9K2)"
              className="flex h-12 flex-1 rounded-lg border border-border bg-background px-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button type="submit" disabled={searching} className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50">
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Find
            </button>
          </form>

          {error && !enrollment && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
          )}

          {enrollment && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Student info */}
              <div className="rounded-xl border border-primary/30 bg-card p-6 glow-border">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">Student Details</h3>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div><span className="text-muted-foreground">ID:</span> <span className="font-mono font-semibold text-primary">{enrollment.enrollment_id}</span></div>
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{enrollment.full_name}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{enrollment.email}</span></div>
                  <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{enrollment.course}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{enrollment.status}</span></div>
                </div>
              </div>

              {/* Existing certificates */}
              {existingCerts.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Award size={16} className="text-primary" /> Issued Documents ({existingCerts.length})</h3>
                  <div className="space-y-3">
                    {existingCerts.map((cert) => (
                      <div key={cert.id} className="rounded-lg border border-border bg-card p-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">{cert.type}</span>
                          <span className="text-xs text-muted-foreground">{new Date(cert.issued_date).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-2 text-muted-foreground">{cert.course}</p>
                        {cert.description && <p className="mt-1 text-xs text-muted-foreground">{cert.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issue new cert form */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Plus size={16} className="text-primary" /> Issue New Document</h3>
                {success && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                    <CheckCircle size={16} /> {success}
                  </div>
                )}
                {error && enrollment && (
                  <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                )}
                <form onSubmit={issueCertificate} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Document Type</label>
                    <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Select type...</option>
                      {certTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Description / Notes (optional)</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={500} className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Outstanding performance in final project..." />
                  </div>
                  <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Issuing...</> : <><Award size={16} /> Issue Document</>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AdminCertificates;
