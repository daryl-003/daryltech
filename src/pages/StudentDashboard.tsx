import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, Award, FileText, Download, Loader2,
  BookOpen, User, ShieldCheck, Settings, Calendar, TrendingUp,
  Upload, ClipboardList, CheckCircle, Clock as ClockIcon
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const sidebarGroups = [
  {
    label: "Main Menu",
    items: [
      { label: "Dashboard", path: "/student/dashboard", icon: <BookOpen size={18} /> },
      { label: "Courses", path: "/courses", icon: <GraduationCap size={18} /> },
    ],
  },
  {
    label: "Academic",
    items: [
      { label: "Tasks", path: "/student/dashboard", icon: <ClipboardList size={18} /> },
      { label: "Certificates", path: "/student/dashboard", icon: <Award size={18} /> },
      { label: "Internship", path: "/student/dashboard", icon: <FileText size={18} /> },
      { label: "Verify", path: "/courses/verify", icon: <ShieldCheck size={18} /> },
      { label: "Settings", path: "/profile/settings", icon: <Settings size={18} /> },
    ],
  },
];

const COURSE_MODULES: Record<string, string[]> = {
  "Web Development": ["HTML & CSS", "JavaScript Basics", "React Fundamentals", "Node.js & APIs", "Databases", "Deployment"],
  "Full-Stack Web Development": ["HTML & CSS", "JavaScript Basics", "React Fundamentals", "Node.js & APIs", "Databases", "Deployment"],
  "Data Science": ["Python Basics", "Statistics", "Pandas & NumPy", "Data Visualization", "Machine Learning Intro", "Capstone Project"],
  "Cybersecurity": ["Network Fundamentals", "Linux Security", "Ethical Hacking", "Penetration Testing", "Compliance"],
  "Cybersecurity Fundamentals": ["Network Fundamentals", "Linux Security", "Ethical Hacking", "Penetration Testing", "Compliance"],
  "Mobile App Development": ["React Native Setup", "Components & Navigation", "State Management", "APIs & Storage", "Publishing"],
  "AI & Machine Learning": ["Python & Math", "Neural Networks", "TensorFlow", "NLP", "Computer Vision", "Deployment"],
  "Cloud Computing": ["Cloud Concepts", "AWS Fundamentals", "Docker", "Kubernetes", "CI/CD", "Infrastructure as Code"],
  "Cloud Engineering & DevOps": ["Cloud Concepts", "AWS Fundamentals", "Docker", "Kubernetes", "CI/CD", "Infrastructure as Code"],
  "UI/UX Design": ["Design Thinking", "Wireframing", "Figma", "Prototyping", "User Testing"],
  "Digital Marketing": ["SEO", "Social Media", "Content Strategy", "Analytics", "PPC Advertising"],
  "IT Support & Administration": ["Hardware", "Networking", "OS Administration", "Troubleshooting", "Security Basics"],
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, any[]>>({});
  const [taskSubmissions, setTaskSubmissions] = useState<any[]>([]);

  // Task submission form
  const [taskForm, setTaskForm] = useState({ enrollmentId: "", taskTitle: "", description: "" });
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [submittingTask, setSubmittingTask] = useState(false);
  const taskFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      setProfile(profileData);

      const email = session.user.email;
      if (email) {
        const { data: enrollData } = await supabase
          .from("enrollments").select("*").eq("email", email).order("created_at", { ascending: false });
        setEnrollments(enrollData || []);

        // Fetch task submissions
        const { data: taskData } = await supabase
          .from("task_submissions").select("*").eq("student_email", email).order("created_at", { ascending: false });
        setTaskSubmissions(taskData || []);

        const enrollIds = (enrollData || []).map(e => e.enrollment_id);
        if (enrollIds.length > 0) {
          const { data: certData } = await supabase
            .from("certificates").select("*").in("enrollment_id", enrollIds).order("created_at", { ascending: false });
          setCertificates(certData || []);

          const { data: offerData } = await supabase
            .from("internship_offers").select("*").in("enrollment_id", enrollIds).order("created_at", { ascending: false });
          setOffers(offerData || []);

          const { data: progressData } = await supabase
            .from("course_progress").select("*").in("enrollment_id", enrollIds);
          const progressMap: Record<string, any[]> = {};
          (progressData || []).forEach(p => {
            if (!progressMap[p.enrollment_id]) progressMap[p.enrollment_id] = [];
            progressMap[p.enrollment_id].push(p);
          });
          setCourseProgress(progressMap);
        }
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const downloadOffer = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("get-signed-url", {
        body: { bucket: "offer-letters", path: fileUrl },
      });
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    }
  };

  const handleTaskSubmit = async () => {
    if (!taskFile || !taskForm.enrollmentId || !taskForm.taskTitle) {
      toast({ title: "Please fill required fields and attach a file", variant: "destructive" });
      return;
    }
    const enrollment = enrollments.find(e => e.enrollment_id === taskForm.enrollmentId);
    if (!enrollment) {
      toast({ title: "Invalid enrollment selected", variant: "destructive" });
      return;
    }
    setSubmittingTask(true);
    try {
      const ext = taskFile.name.split(".").pop();
      const path = `${taskForm.enrollmentId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("task-submissions").upload(path, taskFile);
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from("task_submissions").insert({
        enrollment_id: enrollment.enrollment_id,
        student_name: enrollment.full_name,
        student_email: enrollment.email,
        course: enrollment.course,
        task_title: taskForm.taskTitle,
        description: taskForm.description || null,
        file_url: path,
        file_name: taskFile.name,
      });
      if (dbErr) throw dbErr;

      // Notify staff/admin via email
      try {
        await supabase.functions.invoke("send-notification", {
          body: { type: "task_submitted", data: { student_name: enrollment.full_name, student_email: enrollment.email, course: enrollment.course, task_title: taskForm.taskTitle, enrollment_id: enrollment.enrollment_id } },
        });
      } catch {}

      toast({ title: "Task submitted successfully!" });
      setTaskForm({ enrollmentId: "", taskTitle: "", description: "" });
      setTaskFile(null);

      // Refresh submissions
      const { data: taskData } = await supabase
        .from("task_submissions").select("*").eq("student_email", user.email).order("created_at", { ascending: false });
      setTaskSubmissions(taskData || []);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingTask(false);
    }
  };

  const getAvatarUrl = (path: string) => {
    if (!path) return "";
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const getProgressForEnrollment = (enrollment: any) => {
    const modules = COURSE_MODULES[enrollment.course] || ["Module 1", "Module 2", "Module 3", "Module 4"];
    const progress = courseProgress[enrollment.enrollment_id] || [];
    const completedModules = progress.filter(p => p.completed).length;
    return { modules, completedModules, total: modules.length, percentage: modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0 };
  };

  if (loading) {
    return (
      <DashboardSidebar groups={sidebarGroups}>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardSidebar>
    );
  }

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0];
  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + getProgressForEnrollment(e).percentage, 0) / enrollments.length)
    : 0;

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  const kpis = [
    { label: "Courses", value: enrollments.length, icon: BookOpen },
    { label: "Tasks", value: taskSubmissions.length, icon: ClipboardList, color: "text-blue-400" },
    { label: "Pending", value: taskSubmissions.filter(t => t.status === "assigned" || t.status === "pending").length, icon: ClockIcon, color: "text-orange-400" },
    { label: "Approved", value: taskSubmissions.filter(t => t.status === "approved").length, icon: CheckCircle, color: "text-green-400" },
    { label: "Certificates", value: certificates.length, icon: Award, color: "text-yellow-400" },
    { label: "Progress", value: `${overallProgress}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <DashboardSidebar groups={sidebarGroups}>
      <div className="px-4 py-4 pt-16 sm:px-6 lg:px-10 lg:py-8 lg:pt-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <DashboardHeader
          title={`Hi, ${displayName?.split(" ")[0] || "there"}`}
          subtitle={user?.email}
          avatarUrl={profile?.avatar_url ? getAvatarUrl(profile.avatar_url) : undefined}
          avatarFallback={displayName?.[0]?.toUpperCase() || <User size={16} />}
          kpis={kpis}
          rightSlot={
            <Button variant="outline" size="sm" className="hidden sm:inline-flex h-10 rounded-full" onClick={() => navigate("/profile/settings")}>
              <Settings size={14} className="mr-1.5" /> Profile
            </Button>
          }
        />

        <div className="mt-6">

        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="courses"><BookOpen size={14} className="mr-1" /> My Courses</TabsTrigger>
            <TabsTrigger value="tasks"><ClipboardList size={14} className="mr-1" /> Tasks</TabsTrigger>
            <TabsTrigger value="certificates"><Award size={14} className="mr-1" /> Certificates</TabsTrigger>
            <TabsTrigger value="internships"><FileText size={14} className="mr-1" /> Internship</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
                  <Button className="mt-4" onClick={() => navigate("/courses/enroll")}>Enroll Now</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {enrollments.map(e => {
                  const prog = getProgressForEnrollment(e);
                  return (
                    <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="hover:border-primary/30 transition-all">
                        <CardContent className="p-5">
                          <div className="mb-3 flex items-center justify-between">
                            <Badge variant={e.status === "Active" ? "default" : "secondary"}>{e.status}</Badge>
                            <span className="font-mono text-[10px] text-primary">{e.enrollment_id}</span>
                          </div>
                          <h3 className="mb-1 text-base font-semibold">{e.course}</h3>
                          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar size={10} />
                            <span>{new Date(e.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-mono text-primary">{prog.percentage}%</span>
                            </div>
                            <Progress value={prog.percentage} className="h-2" />
                            <p className="text-[10px] text-muted-foreground">{prog.completedModules}/{prog.total} modules completed</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Task Submissions */}
          <TabsContent value="tasks">
            <div className="space-y-6">
              {/* Assigned Tasks */}
              {taskSubmissions.filter(t => t.status === "assigned").length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><ClipboardList size={16} /> Assigned Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {taskSubmissions.filter(t => t.status === "assigned").map(t => (
                        <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{t.task_title}</h4>
                                <Badge variant="outline" className="text-[10px] border-blue-500/50 text-blue-400">assigned</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{t.course} • {t.enrollment_id}</p>
                              {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                              {t.due_date && (
                                <p className={`mt-1 text-xs font-medium ${new Date(t.due_date) < new Date() ? "text-destructive" : "text-primary"}`}>
                                  📅 Due: {new Date(t.due_date).toLocaleDateString()} {new Date(t.due_date) < new Date() ? "(Overdue)" : ""}
                                </p>
                              )}
                              <p className="mt-1 text-[10px] text-muted-foreground">Assigned: {new Date(t.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.zip,.rar,.js,.ts,.py,.html,.css"
                              id={`upload-${t.id}`}
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setSubmittingTask(true);
                                try {
                                  const ext = file.name.split(".").pop();
                                  const path = `${t.enrollment_id}-${Date.now()}.${ext}`;
                                  const { error: upErr } = await supabase.storage.from("task-submissions").upload(path, file);
                                  if (upErr) throw upErr;
                                  const { error: dbErr } = await supabase.from("task_submissions")
                                    .update({ file_url: path, file_name: file.name, status: "pending" })
                                    .eq("id", t.id);
                                  if (dbErr) throw dbErr;
                                   toast({ title: "Task submitted!" });
                                  // Notify staff/admin
                                  try {
                                    await supabase.functions.invoke("send-notification", {
                                      body: { type: "task_submitted", data: { student_name: t.student_name, student_email: t.student_email, course: t.course, task_title: t.task_title, enrollment_id: t.enrollment_id } },
                                    });
                                  } catch {}
                                  const { data: taskData } = await supabase
                                    .from("task_submissions").select("*").eq("student_email", user.email).order("created_at", { ascending: false });
                                  setTaskSubmissions(taskData || []);
                                } catch (err: any) {
                                  toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                                } finally { setSubmittingTask(false); }
                              }}
                            />
                            <Button size="sm" variant="outline" onClick={() => document.getElementById(`upload-${t.id}`)?.click()} disabled={submittingTask}>
                              {submittingTask ? <><Loader2 size={12} className="mr-1 animate-spin" /> Uploading...</> : <><Upload size={12} className="mr-1" /> Upload Submission</>}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit a new task */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Upload size={16} /> Submit a Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-w-lg">
                  <div>
                    <Label>Select Course *</Label>
                    <Select value={taskForm.enrollmentId} onValueChange={v => setTaskForm({ ...taskForm, enrollmentId: v })}>
                      <SelectTrigger><SelectValue placeholder="Choose enrolled course" /></SelectTrigger>
                      <SelectContent>
                        {enrollments.map(e => (
                          <SelectItem key={e.enrollment_id} value={e.enrollment_id}>{e.course} ({e.enrollment_id})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Task Title *</Label>
                    <Input value={taskForm.taskTitle} onChange={e => setTaskForm({ ...taskForm, taskTitle: e.target.value })} placeholder="e.g. Week 3 - React Components Assignment" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Brief description of your submission" />
                  </div>
                  <div>
                    <Label>Attach File *</Label>
                    <input ref={taskFileRef} type="file" accept=".pdf,.doc,.docx,.zip,.rar,.js,.ts,.py,.html,.css" onChange={e => setTaskFile(e.target.files?.[0] || null)} className="hidden" />
                    <button type="button" onClick={() => taskFileRef.current?.click()}
                      className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {taskFile ? (
                        <>
                          <FileText size={16} className="text-primary" />
                          <span className="truncate text-foreground">{taskFile.name}</span>
                          <span className="ml-auto text-xs">({(taskFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                        </>
                      ) : (
                        <><Upload size={16} /> <span>Click to upload (PDF, DOC, ZIP, code files)</span></>
                      )}
                    </button>
                  </div>
                  <Button onClick={handleTaskSubmit} disabled={submittingTask || enrollments.length === 0}>
                    {submittingTask ? <><Loader2 size={14} className="mr-1 animate-spin" /> Submitting...</> : <><Upload size={14} className="mr-1" /> Submit Task</>}
                  </Button>
                </CardContent>
              </Card>

              {/* Submission History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><ClipboardList size={16} /> My Submissions ({taskSubmissions.filter(t => t.status !== "assigned").length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {taskSubmissions.filter(t => t.status !== "assigned").length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No task submissions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {taskSubmissions.filter(t => t.status !== "assigned").map(t => (
                        <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="rounded-lg border border-border p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-sm">{t.task_title}</h4>
                              <p className="text-xs text-muted-foreground">{t.course} • {t.enrollment_id}</p>
                              {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge variant={statusColor(t.status)} className="text-[10px]">
                                {t.status === "pending" && <ClockIcon size={10} className="mr-1" />}
                                {t.status === "approved" && <CheckCircle size={10} className="mr-1" />}
                                {t.status}
                              </Badge>
                              {t.grade_letter && (
                                <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                                  {t.grade_letter} ({t.grade_score}%)
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{t.file_name}</span>
                            <span>{new Date(t.created_at).toLocaleDateString()}</span>
                          </div>
                          {t.admin_feedback && (
                            <div className="mt-2 rounded bg-primary/5 p-2 text-xs">
                              <span className="font-medium text-primary">Feedback:</span> {t.admin_feedback}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            {certificates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No certificates issued yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {certificates.map(c => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-400" />
                          <Badge variant="outline">{c.type}</Badge>
                        </div>
                        <h3 className="mb-1 font-semibold">{c.course}</h3>
                        <p className="text-xs text-muted-foreground">Issued: {new Date(c.issued_date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">By: {c.issued_by}</p>
                        {c.description && <p className="mt-2 text-xs text-muted-foreground">{c.description}</p>}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="internships">
            {offers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No internship offer letters available yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {offers.map(o => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <Badge variant="default">{o.offer_type}</Badge>
                          <span className="font-mono text-[10px] text-primary">{o.enrollment_id}</span>
                        </div>
                        <h3 className="mb-1 font-semibold">{o.course}</h3>
                        <p className="text-xs text-muted-foreground">{o.file_name}</p>
                        <Button size="sm" className="mt-3 gap-1" onClick={() => downloadOffer(o.file_url)}>
                          <Download size={14} /> Download
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </DashboardSidebar>
  );
};

export default StudentDashboard;
