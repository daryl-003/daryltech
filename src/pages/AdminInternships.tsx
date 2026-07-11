import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Loader2, Search, Mail, Phone, Link as LinkIcon, LayoutDashboard, BookOpen, GraduationCap, ClipboardList, Users, Award, Newspaper, Settings } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUSES = ["pending", "reviewed", "shortlisted", "accepted", "rejected"] as const;
type Status = typeof STATUSES[number];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  reviewed: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  shortlisted: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  accepted: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-500 border-red-500/30",
};

const sidebarGroups = [
  {
    label: "Main Menu",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Courses", path: "/courses", icon: <BookOpen size={18} /> },
    ],
  },
  {
    label: "Academic",
    items: [
      { label: "Students", path: "/admin/dashboard", icon: <GraduationCap size={18} /> },
      { label: "Tasks", path: "/admin/dashboard", icon: <ClipboardList size={18} /> },
      { label: "Staff", path: "/admin/dashboard", icon: <Users size={18} /> },
      { label: "Internships", path: "/admin/internships", icon: <Briefcase size={18} /> },
      { label: "Certificates", path: "/admin/certificates", icon: <Award size={18} /> },
      { label: "Blog Admin", path: "/blog/admin", icon: <Newspaper size={18} /> },
      { label: "Settings", path: "/profile/settings", icon: <Settings size={18} /> },
    ],
  },
];

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  track: string;
  experience_level: string;
  portfolio_url: string | null;
  motivation: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminInternships = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data: role } = await supabase.from("user_roles")
        .select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      if (!role) { setIsAdmin(false); return; }
      setIsAdmin(true);
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      setProfile({ ...p, email: session.user.email });
    };
    check();
  }, [navigate]);

  const fetchApps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("internship_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setApps((data as Application[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchApps();
    const ch = supabase.channel("admin-internship-apps")
      .on("postgres_changes", { event: "*", schema: "public", table: "internship_applications" }, () => fetchApps())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);

  const updateStatus = async (id: string, status: Status) => {
    setUpdatingId(id);
    const { error } = await supabase.from("internship_applications").update({ status }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Marked ${status}` });
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return [a.full_name, a.email, a.track, a.experience_level].some((v) => v?.toLowerCase().includes(q));
    });
  }, [apps, search, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { total: apps.length };
    STATUSES.forEach((s) => (c[s] = 0));
    apps.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [apps]);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Access denied</h1>
          <p className="text-muted-foreground">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardSidebar groups={sidebarGroups}>
      <DashboardHeader
        title="Internship Applications"
        subtitle="Review and manage internship submissions"
        avatarUrl={profile?.avatar_url}
        avatarFallback={(profile?.display_name || profile?.email || "A")[0]?.toUpperCase()}
      />
      <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { label: "Total", value: counts.total },
            ...STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: counts[s] || 0 })),
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, track…" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchApps} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No applications found.</TableCell></TableRow>
                ) : filtered.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                    <TableCell>
                      <div className="font-medium">{a.full_name}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                    </TableCell>
                    <TableCell>{a.track}</TableCell>
                    <TableCell>{a.experience_level}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor[a.status] || ""}>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v as Status)} disabled={updatingId === a.id}>
                        <SelectTrigger className="ml-auto h-8 w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> {selected.full_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={statusColor[selected.status] || ""}>{selected.status}</Badge>
                  <span className="text-xs text-muted-foreground">Submitted {new Date(selected.created_at).toLocaleString()}</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-3">
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Track</div>
                    <div className="font-medium">{selected.track}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Experience</div>
                    <div className="font-medium">{selected.experience_level}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground"><Mail className="h-3 w-3" /> Email</div>
                    <a className="font-medium text-primary hover:underline break-all" href={`mailto:${selected.email}`}>{selected.email}</a>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground"><Phone className="h-3 w-3" /> Phone</div>
                    <div className="font-medium">{selected.phone || <span className="text-muted-foreground">—</span>}</div>
                  </div>
                  {selected.portfolio_url && (
                    <div className="rounded-lg border border-border p-3 sm:col-span-2">
                      <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground"><LinkIcon className="h-3 w-3" /> Portfolio</div>
                      <a href={selected.portfolio_url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline break-all">{selected.portfolio_url}</a>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Motivation</div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.motivation}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground mr-2">Update status:</span>
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selected.status === s ? "default" : "outline"}
                      disabled={updatingId === selected.id}
                      onClick={() => updateStatus(selected.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardSidebar>
  );
};

export default AdminInternships;
