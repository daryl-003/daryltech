import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, GraduationCap, ClipboardList, Loader2, Search,
  UserPlus, BookOpen, Settings, User, CheckCircle, XCircle,
  Download, Star, Users, Sparkles
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminCourseCMS from "@/components/admin/AdminCourseCMS";

const sidebarGroups = [
  {
    label: "Main Menu",
    items: [
      { label: "Dashboard", path: "/staff/dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Courses", path: "/courses", icon: <BookOpen size={18} /> },
    ],
  },
  {
    label: "Academic",
    items: [
      { label: "Students", path: "/staff/dashboard", icon: <GraduationCap size={18} /> },
      { label: "Tasks", path: "/staff/dashboard", icon: <ClipboardList size={18} /> },
      { label: "Settings", path: "/profile/settings", icon: <Settings size={18} /> },
    ],
  },
];

const COURSES = [
  "Web Development", "Data Science", "Cybersecurity",
  "Mobile App Development", "AI & Machine Learning", "Cloud Computing",
  "UI/UX Design", "Digital Marketing",
];

function generateEnrollmentId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "DTEN-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const getLetterGrade = (score: number): string => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  const [staffProfile, setStaffProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<any[]>([]);
  const [searchEnroll, setSearchEnroll] = useState("");
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [gradeScores, setGradeScores] = useState<Record<string, string>>({});
  const [generatingFeedback, setGeneratingFeedback] = useState<Record<string, boolean>>({});

  const [assignTaskForm, setAssignTaskForm] = useState({ enrollmentId: "", taskTitle: "", description: "", dueDate: "" });
  const [assigningTask, setAssigningTask] = useState(false);
  const [assignFoundStudent, setAssignFoundStudent] = useState<any>(null);

  const [addStudentForm, setAddStudentForm] = useState({ fullName: "", email: "", phone: "", course: "" });
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    const checkStaff = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data: roleData } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "staff").maybeSingle();
      if (!roleData) { setIsStaff(false); return; }
      setIsStaff(true);
      const { data: profile } = await supabase
        .from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      setStaffProfile({ ...profile, email: session.user.email });
    };
    checkStaff();
  }, [navigate]);

  useEffect(() => {
    if (!isStaff) return;
    fetchEnrollments();
    fetchTaskSubmissions();
    const enrollCh = supabase.channel("staff-enrollments")
      .on("postgres_changes", { event: "*", schema: "public", table: "enrollments" }, () => fetchEnrollments())
      .subscribe();
    const taskCh = supabase.channel("staff-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "task_submissions" }, () => fetchTaskSubmissions())
      .subscribe();
    return () => { supabase.removeChannel(enrollCh); supabase.removeChannel(taskCh); };
  }, [isStaff]);

  const fetchEnrollments = async () => {
    const { data } = await supabase.functions.invoke("admin-data", { body: { table: "enrollments" } });
    if (data && Array.isArray(data)) setEnrollments(data);
  };
  const fetchTaskSubmissions = async () => {
    const { data } = await supabase.functions.invoke("admin-data", { body: { table: "task_submissions" } });
    if (data && Array.isArray(data)) setTaskSubmissions(data);
  };

  const handleAddStudent = async () => {
    const { fullName, email, phone, course } = addStudentForm;
    if (!fullName || !email || !course) { toast({ title: "Fill required fields", variant: "destructive" }); return; }
    setAddingStudent(true);
    try {
      const enrollmentId = generateEnrollmentId();
      const { error } = await supabase.from("enrollments").insert({
        full_name: fullName, email, phone: phone || null, course,
        enrollment_id: enrollmentId, source: "staff", status: "Active",
      });
      if (error) throw error;
      toast({ title: "Student added!", description: `Enrollment ID: ${enrollmentId}` });
      setAddStudentForm({ fullName: "", email: "", phone: "", course: "" });
      fetchEnrollments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setAddingStudent(false); }
  };

  const lookupAssignStudent = async () => {
    const id = assignTaskForm.enrollmentId.trim().toUpperCase();
    if (!id) return;
    const { data } = await supabase.from("enrollments").select("*").eq("enrollment_id", id).maybeSingle();
    setAssignFoundStudent(data || null);
    if (!data) toast({ title: "Student not found", variant: "destructive" });
  };

  const handleAssignTask = async () => {
    if (!assignFoundStudent || !assignTaskForm.taskTitle) {
      toast({ title: "Look up a student and enter a task title", variant: "destructive" }); return;
    }
    setAssigningTask(true);
    try {
      const insertData: any = {
        enrollment_id: assignFoundStudent.enrollment_id,
        student_name: assignFoundStudent.full_name,
        student_email: assignFoundStudent.email,
        course: assignFoundStudent.course,
        task_title: assignTaskForm.taskTitle,
        description: assignTaskForm.description || null,
        file_url: "pending", file_name: "awaiting submission", status: "assigned",
      };
      if (assignTaskForm.dueDate) insertData.due_date = assignTaskForm.dueDate;
      const { error } = await supabase.from("task_submissions").insert(insertData);
      if (error) throw error;
      toast({ title: "Task assigned!" });
      setAssignTaskForm({ enrollmentId: "", taskTitle: "", description: "", dueDate: "" });
      setAssignFoundStudent(null);
      fetchTaskSubmissions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setAssigningTask(false); }
  };

  const reviewTask = async (taskId: string, status: "approved" | "rejected") => {
    const feedback = feedbackText[taskId] || "";
    const scoreStr = gradeScores[taskId];
    const gradeScore = scoreStr ? parseInt(scoreStr) : null;
    const gradeLetter = gradeScore !== null && !isNaN(gradeScore) ? getLetterGrade(gradeScore) : null;
    try {
      const updateData: any = { status, admin_feedback: feedback || null, reviewed_at: new Date().toISOString() };
      if (gradeScore !== null && !isNaN(gradeScore)) {
        updateData.grade_score = gradeScore;
        updateData.grade_letter = gradeLetter;
      }
      const { error } = await supabase.from("task_submissions").update(updateData).eq("id", taskId);
      if (error) throw error;
      toast({ title: `Task ${status}!${gradeLetter ? ` Grade: ${gradeLetter}` : ""}` });
      fetchTaskSubmissions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const downloadTaskFile = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("get-signed-url", {
        body: { bucket: "task-submissions", path: fileUrl },
      });
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    }
  };

  const getAvatarUrl = (path: string) => {
    if (!path) return "";
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredEnrollments = enrollments.filter(e =>
    !searchEnroll || e.enrollment_id?.includes(searchEnroll.toUpperCase()) || e.full_name?.toLowerCase().includes(searchEnroll.toLowerCase())
  );

  const pendingTasks = taskSubmissions.filter(t => t.status === "pending").length;

  if (isStaff === null) {
    return (
      <DashboardSidebar groups={sidebarGroups}>
        <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardSidebar>
    );
  }
  if (isStaff === false) {
    return (
      <DashboardSidebar groups={sidebarGroups}>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You don't have staff privileges.</p>
        </div>
      </DashboardSidebar>
    );
  }

  const kpis = [
    { label: "Students", value: enrollments.length, icon: GraduationCap },
    { label: "Pending Tasks", value: pendingTasks, icon: ClipboardList, color: "text-orange-400" },
    { label: "Total Tasks", value: taskSubmissions.length, icon: ClipboardList, color: "text-blue-400" },
    { label: "Approved", value: taskSubmissions.filter(t => t.status === "approved").length, icon: CheckCircle, color: "text-green-400" },
    { label: "Rejected", value: taskSubmissions.filter(t => t.status === "rejected").length, icon: XCircle, color: "text-red-400" },
    { label: "Avg Grade", value: (() => { const graded = taskSubmissions.filter(t => t.grade_score); return graded.length ? Math.round(graded.reduce((s, t) => s + t.grade_score, 0) / graded.length) + "%" : "—"; })(), icon: Star, color: "text-yellow-400" },
  ];

  return (
    <DashboardSidebar groups={sidebarGroups}>
      <div className="px-4 py-4 pt-16 sm:px-6 lg:px-10 lg:py-8 lg:pt-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <DashboardHeader
          title="Staff Dashboard"
          subtitle={`Welcome, ${staffProfile?.display_name || "Staff"}`}
          avatarUrl={staffProfile?.avatar_url ? getAvatarUrl(staffProfile.avatar_url) : undefined}
          avatarFallback={staffProfile?.display_name?.[0]?.toUpperCase() || <User size={16} />}
          kpis={kpis}
          onSearch={(q) => setSearchEnroll(q)}
          searchPlaceholder="Search students..."
        />

        <div className="mt-6">

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="students"><GraduationCap size={14} className="mr-1" /> Students</TabsTrigger>
            <TabsTrigger value="add-student"><UserPlus size={14} className="mr-1" /> Add Student</TabsTrigger>
            <TabsTrigger value="tasks"><ClipboardList size={14} className="mr-1" /> Tasks {pendingTasks > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{pendingTasks}</Badge>}</TabsTrigger>
            <TabsTrigger value="cms"><BookOpen size={14} className="mr-1" /> Course CMS</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><GraduationCap size={16} /> Students ({enrollments.length})</CardTitle>
                <div className="mt-2"><Input placeholder="Search..." value={searchEnroll} onChange={e => setSearchEnroll(e.target.value)} className="max-w-sm" /></div>
              </CardHeader>
              <CardContent>
                {filteredEnrollments.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No students found.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Course</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {filteredEnrollments.map(e => (
                          <TableRow key={e.id}>
                            <TableCell className="font-mono text-xs text-primary">{e.enrollment_id}</TableCell>
                            <TableCell className="font-medium">{e.full_name}</TableCell>
                            <TableCell className="text-sm">{e.email}</TableCell>
                            <TableCell className="text-sm">{e.course}</TableCell>
                            <TableCell><Badge variant={e.status === "Active" ? "default" : "secondary"} className="text-xs">{e.status}</Badge></TableCell>
                            <TableCell className="text-muted-foreground text-xs">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-student">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserPlus size={16} /> Add Student</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                <div><Label>Full Name *</Label><Input value={addStudentForm.fullName} onChange={e => setAddStudentForm({ ...addStudentForm, fullName: e.target.value })} placeholder="Student name" /></div>
                <div><Label>Email *</Label><Input type="email" value={addStudentForm.email} onChange={e => setAddStudentForm({ ...addStudentForm, email: e.target.value })} placeholder="student@example.com" /></div>
                <div><Label>Phone</Label><Input value={addStudentForm.phone} onChange={e => setAddStudentForm({ ...addStudentForm, phone: e.target.value })} placeholder="+233..." /></div>
                <div>
                  <Label>Course *</Label>
                  <Select value={addStudentForm.course} onValueChange={v => setAddStudentForm({ ...addStudentForm, course: v })}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>{COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddStudent} disabled={addingStudent}>
                  {addingStudent ? <><Loader2 size={14} className="mr-1 animate-spin" /> Adding...</> : <><UserPlus size={14} className="mr-1" /> Add Student</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardList size={16} /> Assign Task</CardTitle></CardHeader>
                <CardContent className="space-y-4 max-w-lg">
                  <div>
                    <Label>Enrollment ID *</Label>
                    <div className="flex gap-2">
                      <Input value={assignTaskForm.enrollmentId} onChange={e => setAssignTaskForm({ ...assignTaskForm, enrollmentId: e.target.value })} placeholder="DTEN-XXXXXXXX" />
                      <Button variant="outline" onClick={lookupAssignStudent}><Search size={14} className="mr-1" /> Look Up</Button>
                    </div>
                    {assignFoundStudent && (
                      <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <p className="text-sm font-medium">{assignFoundStudent.full_name}</p>
                        <p className="text-xs text-muted-foreground">{assignFoundStudent.email} • {assignFoundStudent.course}</p>
                      </div>
                    )}
                  </div>
                  <div><Label>Task Title *</Label><Input value={assignTaskForm.taskTitle} onChange={e => setAssignTaskForm({ ...assignTaskForm, taskTitle: e.target.value })} placeholder="Assignment title" /></div>
                  <div><Label>Description</Label><Textarea value={assignTaskForm.description} onChange={e => setAssignTaskForm({ ...assignTaskForm, description: e.target.value })} placeholder="Instructions" className="h-20" /></div>
                  <div><Label>Due Date</Label><Input type="date" value={assignTaskForm.dueDate} onChange={e => setAssignTaskForm({ ...assignTaskForm, dueDate: e.target.value })} min={new Date().toISOString().split("T")[0]} /></div>
                  <Button onClick={handleAssignTask} disabled={assigningTask || !assignFoundStudent}>
                    {assigningTask ? <><Loader2 size={14} className="mr-1 animate-spin" /> Assigning...</> : <><ClipboardList size={14} className="mr-1" /> Assign Task</>}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardList size={16} /> All Tasks ({taskSubmissions.length})</CardTitle></CardHeader>
                <CardContent>
                  {taskSubmissions.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No tasks yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {taskSubmissions.map(t => (
                        <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={`rounded-lg border p-4 ${t.status === "pending" ? "border-orange-500/30 bg-orange-500/5" : t.status === "assigned" ? "border-blue-500/30 bg-blue-500/5" : "border-border"}`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">{t.task_title}</h4>
                                <Badge variant={t.status === "approved" ? "default" : t.status === "rejected" ? "destructive" : t.status === "assigned" ? "outline" : "secondary"} className="text-[10px]">{t.status}</Badge>
                                {t.grade_letter && (
                                  <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                                    <Star size={8} className="mr-0.5" /> {t.grade_letter} ({t.grade_score}%)
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{t.student_name} • {t.course} • {t.enrollment_id}</p>
                              {t.file_url && t.file_url !== "pending" && (
                                <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={() => downloadTaskFile(t.file_url)}>
                                  <Download size={12} className="mr-1" /> {t.file_name}
                                </Button>
                              )}
                              {t.status === "assigned" && <p className="mt-2 text-xs text-blue-400 italic">Awaiting submission...</p>}
                              {t.due_date && (
                                <p className={`mt-1 text-xs font-medium ${new Date(t.due_date) < new Date() ? "text-destructive" : "text-primary"}`}>
                                  📅 Due: {new Date(t.due_date).toLocaleDateString()} {new Date(t.due_date) < new Date() ? "(Overdue)" : ""}
                                </p>
                              )}
                            </div>
                            {t.status === "pending" && (
                              <div className="space-y-2 min-w-[220px]">
                                <div>
                                  <Label className="text-xs">Grade (0-100)</Label>
                                  <Input type="number" min={0} max={100} placeholder="Score" className="h-8 text-xs"
                                    value={gradeScores[t.id] || ""}
                                    onChange={e => setGradeScores({ ...gradeScores, [t.id]: e.target.value })}
                                  />
                                  {gradeScores[t.id] && !isNaN(parseInt(gradeScores[t.id])) && (
                                    <p className="mt-0.5 text-[10px] text-primary font-medium">Grade: {getLetterGrade(parseInt(gradeScores[t.id]))}</p>
                                  )}
                                </div>
                                <Textarea placeholder="Feedback" className="text-xs h-14"
                                  value={feedbackText[t.id] || ""}
                                  onChange={e => setFeedbackText({ ...feedbackText, [t.id]: e.target.value })}
                                />
                                <Button
                                  size="sm" variant="outline" className="h-7 text-xs w-full"
                                  disabled={generatingFeedback[t.id]}
                                  onClick={async () => {
                                    setGeneratingFeedback(prev => ({ ...prev, [t.id]: true }));
                                    try {
                                      const { data, error } = await supabase.functions.invoke("ai-feedback", {
                                        body: { task_title: t.task_title, course: t.course, description: t.description, student_name: t.student_name, grade_score: gradeScores[t.id] ? parseInt(gradeScores[t.id]) : null },
                                      });
                                      if (error) throw error;
                                      if (data?.feedback) setFeedbackText(prev => ({ ...prev, [t.id]: data.feedback }));
                                      if (data?.error) throw new Error(data.error);
                                    } catch (err: any) {
                                      toast({ title: "AI Feedback Error", description: err.message, variant: "destructive" });
                                    } finally { setGeneratingFeedback(prev => ({ ...prev, [t.id]: false })); }
                                  }}
                                >
                                  {generatingFeedback[t.id] ? <><Loader2 size={12} className="mr-1 animate-spin" /> Generating...</> : <><Sparkles size={12} className="mr-1" /> AI Suggest Feedback</>}
                                </Button>
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-7 text-xs flex-1" onClick={() => reviewTask(t.id, "approved")}>
                                    <CheckCircle size={12} className="mr-1" /> Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 text-xs flex-1" onClick={() => reviewTask(t.id, "rejected")}>
                                    <XCircle size={12} className="mr-1" /> Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                            {t.status !== "pending" && t.status !== "assigned" && t.admin_feedback && (
                              <div className="rounded bg-muted/50 p-2 text-xs max-w-[200px]">
                                <span className="font-medium">Feedback:</span> {t.admin_feedback}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cms">
            <AdminCourseCMS />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </DashboardSidebar>
  );
};

export default StaffDashboard;
