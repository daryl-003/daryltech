import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Loader2, Save, User, Mail, Phone } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, GraduationCap, Award, FileText, ShieldCheck, Settings,
  LayoutDashboard, Newspaper
} from "lucide-react";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    email: "",
    avatar_url: "",
  });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);

      const { data: roleData } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!roleData);

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();

      if (profile) {
        setForm({
          display_name: profile.display_name || "",
          email: profile.email || session.user.email || "",
          avatar_url: profile.avatar_url || "",
        });
      } else {
        setForm({
          display_name: session.user.user_metadata?.display_name || "",
          email: session.user.email || "",
          avatar_url: "",
        });
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const getAvatarUrl = (path: string) => {
    if (!path) return "";
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      setForm({ ...form, avatar_url: path });
      toast({ title: "Photo uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("profiles").select("id").eq("user_id", user.id).maybeSingle();

      if (existing) {
        const { error } = await supabase.from("profiles").update({
          display_name: form.display_name,
          email: form.email,
          avatar_url: form.avatar_url,
        }).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert({
          user_id: user.id,
          display_name: form.display_name,
          email: form.email,
          avatar_url: form.avatar_url,
        });
        if (error) throw error;
      }
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const sidebarItems = isAdmin
    ? [
        { label: "Overview", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
        { label: "Students", path: "/admin/dashboard", icon: <GraduationCap size={18} /> },
        { label: "Certificates", path: "/admin/certificates", icon: <Award size={18} /> },
        { label: "Blog Admin", path: "/blog/admin", icon: <Newspaper size={18} /> },
        { label: "Settings", path: "/profile/settings", icon: <Settings size={18} /> },
      ]
    : [
        { label: "Overview", path: "/student/dashboard", icon: <BookOpen size={18} /> },
        { label: "Courses", path: "/student/dashboard", icon: <GraduationCap size={18} /> },
        { label: "Certificates", path: "/student/dashboard", icon: <Award size={18} /> },
        { label: "Internship", path: "/student/dashboard", icon: <FileText size={18} /> },
        { label: "Verify", path: "/courses/verify", icon: <ShieldCheck size={18} /> },
        { label: "Settings", path: "/profile/settings", icon: <Settings size={18} /> },
      ];

  if (loading) {
    return (
      <DashboardSidebar items={sidebarItems}>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar items={sidebarItems}>
      <div className="p-6 pt-16 lg:p-10 lg:pt-10">
        <div className="mb-8">
          <p className="text-sm font-mono uppercase tracking-widest text-primary">Settings</p>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        </div>

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Camera size={18} /> Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={form.avatar_url ? getAvatarUrl(form.avatar_url) : ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {form.display_name?.[0]?.toUpperCase() || <User size={32} />}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {uploading ? "Uploading..." : "Click the camera icon to change photo"}
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User size={18} /> Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Display Name</Label>
                <Input
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardSidebar>
  );
};

export default ProfileSettings;
