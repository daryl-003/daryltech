import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Mail, Calendar, GraduationCap, Award, FileText,
  Loader2, Bell, Upload, Search, ChevronRight, UserPlus,
  BookOpen, Newspaper, Settings, User, BellRing, Check, X,
  ClipboardList, CheckCircle, XCircle, MessageSquare, Download,
  Users, Shield, Trash2, Star, Sparkles, Power, PowerOff
} from "lucide-react";
import AdminCourseCMS from "@/components/admin/AdminCourseCMS";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import AdminAIAssetsManager from "@/components/admin/AdminAIAssetsManager";
import JaelFeedbackViewer from "@/components/admin/JaelFeedbackViewer";

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
      { label: "Certificates", path: "/admin/certificates", icon: <Award size={18} /> },
      { label: "Blog Admin", path: "/blog/admin", icon: <Newspaper size={18} /> },
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchEnroll, setSearchEnroll] = useState("");
  const [taskSubmissions, setTaskSubmissions] = useState<any[]>([]);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [gradeScores, setGradeScores] = useState<Record<string, string>>({});
  const [generatingFeedback, setGeneratingFeedback] = useState<Record<string, boolean>>({});

  const [assignTaskForm, setAssignTaskForm] = useState({ enrollmentId: "", taskTitle: "", description: "", dueDate: "" });
  const [assigningTask, setAssigningTask] = useState(false);
  const [assignFoundStudent, setAssignFoundStudent] = useState<any>(null);

  const [offerForm, setOfferForm] = useState({ enrollmentId: "", description: "" });
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [uploadingOffer, setUploadingOffer] = useState(false);
  const [foundStudent, setFoundStudent] = useState<any>(null);

  const [addStudentForm, setAddStudentForm] = useState({
    fullName: "", email: "", phone: "", course: "", source: "admin",
  });
  const [addingStudent, setAddingStudent] = useState(false);

  // Staff management
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffForm, setStaffForm] = useState({ fullName: "", email: "", department: "", password: "" });
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Admin management
  const [adminList, setAdminList] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data: roleData } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      if (!roleData) { setIsAdmin(false); return; }
      setIsAdmin(true);
      const { data: profile } = await supabase
        .from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      setAdminProfile({ ...profile, email: session.user.email });
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
    fetchNotifications();
    fetchStaff();
    fetchAdmins();
    const contactCh = supabase.channel("admin-contacts")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_submissions" }, () => fetchContacts())
      .subscribe();
    const bookingCh = supabase.channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "booking_submissions" }, () => fetchBookings())
      .subscribe();
    const enrollCh = supabase.channel("admin-enrollments")
      .on("postgres_changes", { event: "*", schema: "public", table: "enrollments" }, () => fetchEnrollments())
      .subscribe();
    const notifCh = supabase.channel("admin-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, () => fetchNotifications())
      .subscribe();
    const taskCh = supabase.channel("admin-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "task_submissions" }, () => fetchTaskSubmissions())
      .subscribe();
    return () => {
      supabase.removeChannel(contactCh);
      supabase.removeChannel(bookingCh);
      supabase.removeChannel(enrollCh);
      supabase.removeChannel(notifCh);
      supabase.removeChannel(taskCh);
    };
  }, [isAdmin]);

  const fetchAll = () => { fetchContacts(); fetchBookings(); fetchEnrollments(); fetchCertificates(); fetchOffers(); fetchSubscribers(); fetchTaskSubmissions(); };
  const fetchContacts = async () => { const { data } = await supabase.functions.invoke("admin-data", { body: { table: "contact_submissions" } }); if (data) setContacts(data); };
  const fetchBookings = async () => { const { data } = await supabase.functions.invoke("admin-data", { body: { table: "booking_submissions" } }); if (data) setBookings(data); };
  const fetchEnrollments = async () => { const { data } = await supabase.functions.invoke("admin-data", { body: { table: "enrollments" } }); if (data) setEnrollments(data); };
  const fetchCertificates = async () => { const { data } = await supabase.functions.invoke("admin-data", { body: { table: "certificates" } }); if (data) setCertificates(data); };
  const fetchOffers = async () => { const { data } = await supabase.functions.invoke("admin-data", { body: { table: "internship_offers" } }); if (data) setOffers(data); };
  const fetchSubscribers = async () => { const { data } = await supabase.functions.invoke("admin-data", { body: { table: "newsletter_subscribers", count: true } }); if (data) setSubscribers(typeof data === "number" ? data : Array.isArray(data) ? data.length : 0); };
  const fetchTaskSubmissions = async () => { const { data } = await supabase.functions.invoke("admin-data", { body: { table: "task_submissions" } }); if (data) setTaskSubmissions(data); };
  const fetchNotifications = async () => {
    const { data } = await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) setNotifications(data);
  };
  const fetchStaff = async () => {
    const { data } = await supabase.functions.invoke("manage-staff", { body: { action: "list_staff" } });
    if (data) setStaffList(Array.isArray(data) ? data : []);
  };
  const fetchAdmins = async () => {
    const { data } = await supabase.functions.invoke("manage-staff", { body: { action: "list_admins" } });
    if (data) setAdminList(Array.isArray(data) ? data : []);
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from("admin_notifications").update({ read: true }).eq("id", id);
    fetchNotifications();
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read).map(n => n.id);
    if (unread.length === 0) return;
    for (const id of unread) {
      await supabase.from("admin_notifications").update({ read: true }).eq("id", id);
    }
    fetchNotifications();
  };

  const lookupStudent = async () => {
    const id = offerForm.enrollmentId.trim().toUpperCase();
    if (!id) return;
    const { data } = await supabase.from("enrollments").select("*").eq("enrollment_id", id).maybeSingle();
    setFoundStudent(data || null);
    if (!data) toast({ title: "Student not found", variant: "destructive" });
  };

  const uploadOfferLetter = async () => {
    if (!offerFile || !foundStudent) return;
    setUploadingOffer(true);
    try {
      const ext = offerFile.name.split(".").pop();
      const path = `${foundStudent.enrollment_id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("offer-letters").upload(path, offerFile);
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from("internship_offers").insert({
        enrollment_id: foundStudent.enrollment_id, student_name: foundStudent.full_name,
        course: foundStudent.course, file_url: path, file_name: offerFile.name,
        description: offerForm.description || null,
      });
      if (dbErr) throw dbErr;
      toast({ title: "Offer letter uploaded!" });
      setOfferFile(null); setOfferForm({ enrollmentId: "", description: "" }); setFoundStudent(null);
      fetchOffers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setUploadingOffer(false); }
  };

  const handleAddStudent = async () => {
    const { fullName, email, phone, course } = addStudentForm;
    if (!fullName || !email || !course) {
      toast({ title: "Please fill in required fields", variant: "destructive" }); return;
    }
    setAddingStudent(true);
    try {
      const enrollmentId = generateEnrollmentId();
      const { error } = await supabase.from("enrollments").insert({
        full_name: fullName, email, phone: phone || null, course,
        enrollment_id: enrollmentId, source: "admin", status: "Active",
      });
      if (error) throw error;
      toast({ title: "Student added!", description: `Enrollment ID: ${enrollmentId}` });
      setAddStudentForm({ fullName: "", email: "", phone: "", course: "", source: "admin" });
      fetchEnrollments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setAddingStudent(false); }
  };

  const reviewTask = async (taskId: string, status: "approved" | "rejected") => {
    const feedback = feedbackText[taskId] || "";
    const scoreStr = gradeScores[taskId];
    const gradeScore = scoreStr ? parseInt(scoreStr) : null;
    const gradeLetter = gradeScore !== null && !isNaN(gradeScore) ? getLetterGrade(gradeScore) : null;

    try {
      const updateData: any = {
        status,
        admin_feedback: feedback || null,
        reviewed_at: new Date().toISOString(),
      };
      if (gradeScore !== null && !isNaN(gradeScore)) {
        updateData.grade_score = gradeScore;
        updateData.grade_letter = gradeLetter;
      }

      const { error } = await supabase.from("task_submissions")
        .update(updateData)
        .eq("id", taskId);
      if (error) throw error;
      toast({ title: `Task ${status}!${gradeLetter ? ` Grade: ${gradeLetter} (${gradeScore}%)` : ""}` });
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

  const lookupAssignStudent = async () => {
    const id = assignTaskForm.enrollmentId.trim().toUpperCase();
    if (!id) return;
    const { data } = await supabase.from("enrollments").select("*").eq("enrollment_id", id).maybeSingle();
    setAssignFoundStudent(data || null);
    if (!data) toast({ title: "Student not found", variant: "destructive" });
  };

  const handleAssignTask = async () => {
    if (!assignFoundStudent || !assignTaskForm.taskTitle) {
      toast({ title: "Please look up a student and enter a task title", variant: "destructive" });
      return;
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
        file_url: "pending",
        file_name: "awaiting submission",
        status: "assigned",
      };
      if (assignTaskForm.dueDate) insertData.due_date = assignTaskForm.dueDate;
      const { error } = await supabase.from("task_submissions").insert(insertData);
      if (error) throw error;
      // Send email notification to staff
      try {
        await supabase.functions.invoke("send-notification", {
          body: { type: "task_assigned", data: { student_name: assignFoundStudent.full_name, task_title: assignTaskForm.taskTitle, course: assignFoundStudent.course, due_date: assignTaskForm.dueDate || "No deadline" } },
        });
      } catch {}
      toast({ title: "Task assigned!", description: `Assigned "${assignTaskForm.taskTitle}" to ${assignFoundStudent.full_name}` });
      setAssignTaskForm({ enrollmentId: "", taskTitle: "", description: "", dueDate: "" });
      setAssignFoundStudent(null);
      fetchTaskSubmissions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setAssigningTask(false); }
  };

  const handleCreateStaff = async () => {
    const { fullName, email, department, password } = staffForm;
    if (!fullName || !email || !password) {
      toast({ title: "Name, email, and password are required", variant: "destructive" }); return;
    }
    setCreatingStaff(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-staff", {
        body: { action: "create_staff", full_name: fullName, email, department, password },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Staff created!", description: `Staff ID: ${data.staff_id}` });
      setStaffForm({ fullName: "", email: "", department: "", password: "" });
      fetchStaff();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setCreatingStaff(false); }
  };

  const handleRemoveStaff = async (staffId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-staff", {
        body: { action: "remove_staff", staff_id: staffId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Staff removed" });
      fetchStaff();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSetStaffStatus = async (staffId: string, status: "active" | "inactive") => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-staff", {
        body: { action: "set_staff_status", staff_id: staffId, status },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: status === "active" ? "Staff reactivated" : "Staff deactivated" });
      fetchStaff();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSetStudentStatus = async (enrollmentId: string, status: "Active" | "Inactive") => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-students", {
        body: { action: "set_status", enrollment_id: enrollmentId, status },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: status === "Active" ? "Student reactivated" : "Student deactivated" });
      fetchEnrollments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteStudent = async (enrollmentId: string) => {
    if (!confirm(`Permanently delete ${enrollmentId} and all their data? This cannot be undone.`)) return;
    try {
      const { data, error } = await supabase.functions.invoke("manage-students", {
        body: { action: "delete_student", enrollment_id: enrollmentId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Student permanently deleted" });
      fetchEnrollments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    setAddingAdmin(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-staff", {
        body: { action: "create_admin", email: newAdminEmail },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Admin added!", description: `${newAdminEmail} is now an admin` });
      setNewAdminEmail("");
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setAddingAdmin(false); }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-staff", {
        body: { action: "remove_admin", user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Admin removed" });
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredEnrollments = enrollments.filter(e =>
    !searchEnroll || e.enrollment_id?.includes(searchEnroll.toUpperCase()) || e.full_name?.toLowerCase().includes(searchEnroll.toLowerCase())
  );

  const getAvatarUrl = (path: string) => {
    if (!path) return "";
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingTasks = taskSubmissions.filter(t => t.status === "pending").length;

  const recentActivity = [
    ...contacts.slice(0, 3).map(c => ({ type: "contact", label: `${c.name} sent a message`, time: c.created_at, icon: Mail })),
    ...bookings.slice(0, 3).map(b => ({ type: "booking", label: `${b.name} booked ${b.service}`, time: b.created_at, icon: Calendar })),
    ...enrollments.slice(0, 3).map(e => ({ type: "enrollment", label: `${e.full_name} enrolled in ${e.course}`, time: e.created_at, icon: GraduationCap })),
    ...taskSubmissions.slice(0, 3).map(t => ({ type: "task", label: `${t.student_name} submitted "${t.task_title}"`, time: t.created_at, icon: ClipboardList })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  const courseDistribution = COURSES.map(c => ({
    name: c,
    count: enrollments.filter(e => e.course === c).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  const taskStatusData = [
    { name: "Pending", value: taskSubmissions.filter(t => t.status === "pending").length },
    { name: "Approved", value: taskSubmissions.filter(t => t.status === "approved").length },
    { name: "Rejected", value: taskSubmissions.filter(t => t.status === "rejected").length },
    { name: "Assigned", value: taskSubmissions.filter(t => t.status === "assigned").length },
  ];

  const enrollmentTrend = (() => {
    const months: Record<string, number> = {};
    enrollments.forEach(e => {
      const d = new Date(e.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month: month.slice(5), count }));
  })();

  if (isAdmin === null) {
    return (
      <DashboardSidebar groups={sidebarGroups}>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardSidebar>
    );
  }
  if (isAdmin === false) {
    return (
      <DashboardSidebar groups={sidebarGroups}>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
        </div>
      </DashboardSidebar>
    );
  }

  const kpis = [
    { label: "Students", value: enrollments.length, icon: GraduationCap },
    { label: "Pending Tasks", value: pendingTasks, icon: ClipboardList, color: "text-orange-400" },
    { label: "Staff", value: staffList.length, icon: Users, color: "text-blue-400" },
    { label: "Bookings", value: bookings.length, icon: Calendar, color: "text-green-400" },
    { label: "Certificates", value: certificates.length, icon: Award, color: "text-yellow-400" },
    { label: "Subscribers", value: subscribers, icon: Mail, color: "text-purple-400" },
  ];

  return (
    <DashboardSidebar groups={sidebarGroups}>
      <div className="px-4 py-4 pt-16 sm:px-6 lg:px-10 lg:py-8 lg:pt-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle={`Welcome back, ${adminProfile?.display_name || "Admin"}`}
          avatarUrl={adminProfile?.avatar_url ? getAvatarUrl(adminProfile.avatar_url) : undefined}
          avatarFallback={adminProfile?.display_name?.[0]?.toUpperCase() || <User size={16} />}
          kpis={kpis}
          notifications={notifications}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllRead}
          onSearch={(q) => setSearchEnroll(q)}
          searchPlaceholder="Search students, tasks..."
        />

        <div className="mt-6">
          {/* Analytics Charts */}
          <AnalyticsCharts
            courseDistribution={courseDistribution}
            taskStatusData={taskStatusData}
            enrollmentTrend={enrollmentTrend}
          />
        </div>

        {/* Overview Grid */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityFeed
              title="Recent Activity"
              emptyText="No recent activity yet."
              items={recentActivity.map((a, i) => ({
                id: `${i}-${a.time}`,
                title: a.label,
                timestamp: a.time,
                icon: a.icon,
                tone: "primary" as const,
              }))}
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><BookOpen size={16} /> Course Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {courseDistribution.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No enrollments yet</p>
              ) : (
                <div className="space-y-4">
                  {courseDistribution.map(c => (
                    <div key={c.name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="truncate pr-2">{c.name}</span>
                        <span className="font-mono text-primary">{c.count}</span>
                      </div>
                      <Progress value={(c.count / enrollments.length) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for management */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="students"><GraduationCap size={14} className="mr-1" /> Students</TabsTrigger>
            <TabsTrigger value="add-student"><UserPlus size={14} className="mr-1" /> Add Student</TabsTrigger>
            <TabsTrigger value="tasks"><ClipboardList size={14} className="mr-1" /> Tasks {pendingTasks > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{pendingTasks}</Badge>}</TabsTrigger>
            <TabsTrigger value="staff"><Users size={14} className="mr-1" /> Staff</TabsTrigger>
            <TabsTrigger value="admins"><Shield size={14} className="mr-1" /> Admins</TabsTrigger>
            <TabsTrigger value="contacts"><Mail size={14} className="mr-1" /> Contacts</TabsTrigger>
            <TabsTrigger value="bookings"><Calendar size={14} className="mr-1" /> Bookings</TabsTrigger>
            <TabsTrigger value="certificates"><Award size={14} className="mr-1" /> Certificates</TabsTrigger>
            <TabsTrigger value="offers"><FileText size={14} className="mr-1" /> Offers</TabsTrigger>
            <TabsTrigger value="cms"><BookOpen size={14} className="mr-1" /> Course CMS</TabsTrigger>
            <TabsTrigger value="jael"><Sparkles size={14} className="mr-1" /> Jael AI</TabsTrigger>
          </TabsList>

          {/* Students */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><GraduationCap size={16} /> Enrolled Students ({enrollments.length})</CardTitle>
                <div className="mt-2">
                  <Input placeholder="Search by name or ID..." value={searchEnroll} onChange={e => setSearchEnroll(e.target.value)} className="max-w-sm" />
                </div>
              </CardHeader>
              <CardContent>
                {filteredEnrollments.length === 0 ? <p className="text-muted-foreground py-8 text-center text-sm">No students found.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Course</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {filteredEnrollments.map(e => (
                          <TableRow key={e.id}>
                            <TableCell className="font-mono text-xs text-primary">{e.enrollment_id}</TableCell>
                            <TableCell className="font-medium">{e.full_name}</TableCell>
                            <TableCell className="text-sm">{e.email}</TableCell>
                            <TableCell className="text-sm">{e.course}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{e.source}</Badge></TableCell>
                            <TableCell><Badge variant={e.status === "Active" ? "default" : "secondary"} className="text-xs">{e.status}</Badge></TableCell>
                            <TableCell className="text-muted-foreground text-xs">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {e.status === "Active" ? (
                                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Deactivate" onClick={() => handleSetStudentStatus(e.enrollment_id, "Inactive")}>
                                    <PowerOff size={14} />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="Reactivate" onClick={() => handleSetStudentStatus(e.enrollment_id, "Active")}>
                                    <Power size={14} />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete permanently" onClick={() => handleDeleteStudent(e.enrollment_id)}>
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Student */}
          <TabsContent value="add-student">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserPlus size={16} /> Add New Student</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                <div><Label>Full Name *</Label><Input value={addStudentForm.fullName} onChange={e => setAddStudentForm({...addStudentForm, fullName: e.target.value})} placeholder="Student full name" /></div>
                <div><Label>Email *</Label><Input type="email" value={addStudentForm.email} onChange={e => setAddStudentForm({...addStudentForm, email: e.target.value})} placeholder="student@example.com" /></div>
                <div><Label>Phone</Label><Input value={addStudentForm.phone} onChange={e => setAddStudentForm({...addStudentForm, phone: e.target.value})} placeholder="+233..." /></div>
                <div>
                  <Label>Course *</Label>
                  <Select value={addStudentForm.course} onValueChange={v => setAddStudentForm({...addStudentForm, course: v})}>
                    <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                    <SelectContent>{COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddStudent} disabled={addingStudent}>
                  {addingStudent ? <><Loader2 size={14} className="mr-1 animate-spin" /> Adding...</> : <><UserPlus size={14} className="mr-1" /> Add Student & Generate ID</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task Submissions with Grading */}
          <TabsContent value="tasks">
            <div className="space-y-6">
              {/* Assign Task Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><ClipboardList size={16} /> Assign Task to Student</CardTitle>
                </CardHeader>
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
                  <div><Label>Task Title *</Label><Input value={assignTaskForm.taskTitle} onChange={e => setAssignTaskForm({ ...assignTaskForm, taskTitle: e.target.value })} placeholder="e.g. Week 3 - React Components Assignment" /></div>
                  <div><Label>Description / Instructions</Label><Textarea value={assignTaskForm.description} onChange={e => setAssignTaskForm({ ...assignTaskForm, description: e.target.value })} placeholder="Describe what the student should submit" className="h-20" /></div>
                  <div><Label>Due Date</Label><Input type="date" value={assignTaskForm.dueDate} onChange={e => setAssignTaskForm({ ...assignTaskForm, dueDate: e.target.value })} min={new Date().toISOString().split("T")[0]} /></div>
                  <Button onClick={handleAssignTask} disabled={assigningTask || !assignFoundStudent}>
                    {assigningTask ? <><Loader2 size={14} className="mr-1 animate-spin" /> Assigning...</> : <><ClipboardList size={14} className="mr-1" /> Assign Task</>}
                  </Button>
                </CardContent>
              </Card>

              {/* Task Submissions List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><ClipboardList size={16} /> All Tasks ({taskSubmissions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {taskSubmissions.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">No tasks yet.</p>
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
                                <Badge variant={t.status === "approved" ? "default" : t.status === "rejected" ? "destructive" : t.status === "assigned" ? "outline" : "secondary"} className="text-[10px]">
                                  {t.status}
                                </Badge>
                                {t.grade_letter && (
                                  <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                                    <Star size={8} className="mr-0.5" /> {t.grade_letter} ({t.grade_score}%)
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{t.student_name} • {t.course} • {t.enrollment_id}</p>
                              <p className="text-xs text-muted-foreground">{t.student_email}</p>
                              {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                              {t.file_url && t.file_url !== "pending" && (
                                <div className="mt-2 flex items-center gap-3">
                                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadTaskFile(t.file_url)}>
                                    <Download size={12} className="mr-1" /> {t.file_name}
                                  </Button>
                                  <span className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</span>
                                </div>
                              )}
                              {t.status === "assigned" && (
                                <p className="mt-2 text-xs text-blue-400 italic">Awaiting student submission...</p>
                              )}
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
                                  <Input
                                    type="number" min={0} max={100}
                                    placeholder="Score"
                                    className="h-8 text-xs"
                                    value={gradeScores[t.id] || ""}
                                    onChange={e => setGradeScores({ ...gradeScores, [t.id]: e.target.value })}
                                  />
                                  {gradeScores[t.id] && !isNaN(parseInt(gradeScores[t.id])) && (
                                    <p className="mt-0.5 text-[10px] text-primary font-medium">
                                      Letter Grade: {getLetterGrade(parseInt(gradeScores[t.id]))}
                                    </p>
                                  )}
                                </div>
                                <Textarea
                                  placeholder="Feedback (optional)"
                                  className="text-xs h-14"
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

          {/* Staff Management */}
          <TabsContent value="staff">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserPlus size={16} /> Create Staff Account</CardTitle></CardHeader>
                <CardContent className="space-y-4 max-w-lg">
                  <div><Label>Full Name *</Label><Input value={staffForm.fullName} onChange={e => setStaffForm({ ...staffForm, fullName: e.target.value })} placeholder="Staff member name" /></div>
                  <div><Label>Email *</Label><Input type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} placeholder="staff@example.com" /></div>
                  <div><Label>Department</Label><Input value={staffForm.department} onChange={e => setStaffForm({ ...staffForm, department: e.target.value })} placeholder="e.g. Education, IT Support" /></div>
                  <div><Label>Temporary Password *</Label><Input type="password" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} placeholder="Minimum 6 characters" /></div>
                  <Button onClick={handleCreateStaff} disabled={creatingStaff}>
                    {creatingStaff ? <><Loader2 size={14} className="mr-1 animate-spin" /> Creating...</> : <><UserPlus size={14} className="mr-1" /> Create Staff & Generate ID</>}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users size={16} /> Staff Members ({staffList.length})</CardTitle></CardHeader>
                <CardContent>
                  {staffList.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No staff members yet.</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead>Staff ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {staffList.map(s => (
                            <TableRow key={s.id}>
                              <TableCell className="font-mono text-xs text-primary">{s.staff_id}</TableCell>
                              <TableCell className="font-medium">{s.full_name}</TableCell>
                              <TableCell className="text-sm">{s.email}</TableCell>
                              <TableCell className="text-sm">{s.department || "—"}</TableCell>
                              <TableCell><Badge variant={s.status === "inactive" ? "secondary" : "default"} className="text-xs">{s.status || "active"}</Badge></TableCell>
                              <TableCell className="text-muted-foreground text-xs">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {s.status === "inactive" ? (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="Reactivate" onClick={() => handleSetStaffStatus(s.staff_id, "active")}>
                                      <Power size={14} />
                                    </Button>
                                  ) : (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Deactivate" onClick={() => handleSetStaffStatus(s.staff_id, "inactive")}>
                                      <PowerOff size={14} />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete permanently" onClick={() => handleRemoveStaff(s.staff_id)}>
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Management */}
          <TabsContent value="admins">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shield size={16} /> Add New Admin</CardTitle></CardHeader>
                <CardContent className="space-y-4 max-w-lg">
                  <p className="text-xs text-muted-foreground">The user must have an existing account. Enter their registered email.</p>
                  <div className="flex gap-2">
                    <Input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="user@example.com" />
                    <Button onClick={handleAddAdmin} disabled={addingAdmin}>
                      {addingAdmin ? <Loader2 size={14} className="animate-spin" /> : <><Shield size={14} className="mr-1" /> Add</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shield size={16} /> Current Admins ({adminList.length})</CardTitle></CardHeader>
                <CardContent>
                  {adminList.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No admins found.</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead></TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {adminList.map(a => (
                            <TableRow key={a.user_id}>
                              <TableCell className="font-medium">{a.display_name || "—"}</TableCell>
                              <TableCell className="text-sm">{a.email}</TableCell>
                              <TableCell>
                                {a.is_main ? (
                                  <Badge className="text-xs">Main Admin</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {!a.is_main && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveAdmin(a.user_id)}>
                                    <Trash2 size={14} />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Mail size={16} /> Contact Submissions</CardTitle></CardHeader>
              <CardContent>
                {contacts.length === 0 ? <p className="text-muted-foreground py-8 text-center text-sm">No contact submissions yet.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead><TableHead>Message</TableHead><TableHead>Date</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {contacts.map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell>{c.subject}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{c.message}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Calendar size={16} /> Booking Requests</CardTitle></CardHeader>
              <CardContent>
                {bookings.length === 0 ? <p className="text-muted-foreground py-8 text-center text-sm">No bookings yet.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Service</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {bookings.map(b => (
                          <TableRow key={b.id}>
                            <TableCell className="font-medium">{b.name}</TableCell>
                            <TableCell>{b.email}</TableCell>
                            <TableCell><Badge variant="outline">{b.service}</Badge></TableCell>
                            <TableCell>{b.preferred_date}</TableCell>
                            <TableCell>{b.preferred_time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><Award size={16} /> Issued Certificates</CardTitle>
                  <Button size="sm" asChild><Link to="/admin/certificates"><ChevronRight size={14} className="mr-1" /> Issue New</Link></Button>
                </div>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? <p className="text-muted-foreground py-8 text-center text-sm">No certificates issued yet.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Student</TableHead><TableHead>ID</TableHead><TableHead>Course</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {certificates.map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.student_name}</TableCell>
                            <TableCell className="font-mono text-xs text-primary">{c.enrollment_id}</TableCell>
                            <TableCell>{c.course}</TableCell>
                            <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                            <TableCell className="text-muted-foreground text-xs">{new Date(c.issued_date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offer Letters */}
          <TabsContent value="offers">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Upload size={16} /> Upload Offer Letter</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Input placeholder="Enrollment ID (e.g. DTEN-A3B7X9K2)" value={offerForm.enrollmentId} onChange={e => setOfferForm({...offerForm, enrollmentId: e.target.value})} className="flex-1" />
                    <Button variant="outline" onClick={lookupStudent}><Search size={14} className="mr-1" /> Find</Button>
                  </div>
                  {foundStudent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                        <p><span className="text-muted-foreground">Student:</span> <strong>{foundStudent.full_name}</strong></p>
                        <p><span className="text-muted-foreground">Course:</span> {foundStudent.course}</p>
                      </div>
                      <Input placeholder="Description (optional)" value={offerForm.description} onChange={e => setOfferForm({...offerForm, description: e.target.value})} />
                      <div>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={e => setOfferFile(e.target.files?.[0] || null)} className="text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20" />
                      </div>
                      <Button onClick={uploadOfferLetter} disabled={!offerFile || uploadingOffer}>
                        {uploadingOffer ? <><Loader2 size={14} className="mr-1 animate-spin" /> Uploading...</> : <><Upload size={14} className="mr-1" /> Upload</>}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText size={16} /> Issued Offer Letters ({offers.length})</CardTitle></CardHeader>
                <CardContent>
                  {offers.length === 0 ? <p className="text-muted-foreground py-8 text-center text-sm">No offer letters yet.</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead>Student</TableHead><TableHead>ID</TableHead><TableHead>Course</TableHead><TableHead>File</TableHead><TableHead>Date</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {offers.map(o => (
                            <TableRow key={o.id}>
                              <TableCell className="font-medium">{o.student_name}</TableCell>
                              <TableCell className="font-mono text-xs text-primary">{o.enrollment_id}</TableCell>
                              <TableCell>{o.course}</TableCell>
                              <TableCell className="text-xs">{o.file_name}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Course Content Management */}
          <TabsContent value="cms" className="space-y-4">
            <AdminCourseCMS />
          </TabsContent>

          {/* Jael AI Assistant assets + feedback */}
          <TabsContent value="jael" className="space-y-4">
            <AdminAIAssetsManager />
            <JaelFeedbackViewer />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardSidebar>
  );
};

export default AdminDashboard;
