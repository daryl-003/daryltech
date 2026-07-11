import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import darylLogo from "@/assets/daryl-tech-logo.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via recovery link — ready to reset
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "Password updated successfully!" });
      setTimeout(() => navigate("/auth"), 3000);
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
        className="hidden w-[55%] items-center justify-center lg:flex"
        style={{ background: "hsl(215, 40%, 12%)" }}
      >
        <img src={darylLogo} alt="Daryl Tech" className="max-w-[420px] w-[70%] select-none" />
      </motion.div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[380px]"
        >
          <h1 className="mb-1 text-center text-2xl font-bold tracking-widest text-foreground font-serif">
            DARYL TECH
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground font-serif">
            & Educational Network
          </p>

          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-lg font-semibold">Password updated!</h2>
              <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <Lock className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h2 className="text-lg font-semibold">Set new password</h2>
                <p className="mt-1 text-sm text-muted-foreground">Enter your new password below.</p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="new password"
                  className="rounded-lg border-border bg-card py-5 text-sm"
                  required
                  minLength={6}
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="confirm password"
                  className="rounded-lg border-border bg-card py-5 text-sm"
                  required
                  minLength={6}
                />
                <Button type="submit" className="w-full rounded-lg py-5 text-sm font-semibold" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
