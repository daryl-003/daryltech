import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import darylLogo from "@/assets/daryl-tech-logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden w-[55%] items-center justify-center lg:flex"
        style={{ background: "hsl(215, 40%, 12%)" }}
      >
        <motion.img
          src={darylLogo}
          alt="Daryl Tech"
          className="max-w-[420px] w-[70%] select-none"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </motion.div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[380px]"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <img src={darylLogo} alt="Daryl Tech" className="h-16" />
          </div>

          <h1 className="mb-1 text-center text-2xl font-bold tracking-widest text-foreground font-serif">
            DARYL TECH
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground font-serif">
            & Educational Network
          </p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <CheckCircle className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to <strong className="text-foreground">{email}</strong>
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <Mail className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Forgot your password?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="rounded-lg border-border bg-card py-5 text-sm placeholder:text-muted-foreground"
                  required
                />
                <Button type="submit" className="w-full rounded-lg py-5 text-sm font-semibold" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="mt-6 text-center">
                <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
