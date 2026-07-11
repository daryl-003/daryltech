import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, FileText, CheckCircle, Lock, Clock, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QuizComponent from "@/components/course/QuizComponent";
import AssignmentComponent from "@/components/course/AssignmentComponent";
import { COURSE_MODULES } from "@/data/courseModules";

const CourseContent = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<typeof COURSE_MODULES[string] | null>(null);

  // Load DB modules with fallback to static data
  useEffect(() => {
    if (!courseId) return;
    const loadCourse = async () => {
      const { data: dbModules } = await supabase
        .from("course_modules").select("*")
        .eq("course_id", courseId).order("position");

      if (dbModules && dbModules.length > 0) {
        const ids = dbModules.map((m: any) => m.id);
        const { data: dbLessons } = await supabase
          .from("course_lessons").select("*").in("module_id", ids).order("position");
        const lessonsByModule: Record<string, any[]> = {};
        (dbLessons || []).forEach((l: any) => {
          (lessonsByModule[l.module_id] ||= []).push({
            id: l.id, title: l.title, type: l.type, duration: l.duration,
            content: l.content, videoUrl: l.video_url,
            quiz: l.quiz, assignment: l.assignment,
          });
        });
        setCourseData({
          title: COURSE_MODULES[courseId]?.title || "Course",
          modules: dbModules.map((m: any) => ({
            id: m.id, title: m.title, lessons: lessonsByModule[m.id] || [],
          })),
        });
      } else {
        setCourseData(COURSE_MODULES[courseId] || null);
      }
    };
    loadCourse();
  }, [courseId]);

  // Check enrollment & load saved progress
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsEnrolled(false); return; }

      setUserId(session.user.id);

      setStudentEmail(session.user.email || "");

      const { data } = await supabase
        .from("enrollments")
        .select("enrollment_id, status, payment_status, course, full_name")
        .eq("email", session.user.email);

      // Active enrollment matching this course AND payment confirmed
      const active = data?.find(
        (e: any) =>
          e.status === "Active" &&
          e.payment_status === "paid" &&
          (!courseId || e.course === courseId || e.course?.toLowerCase().includes(courseId.toLowerCase())),
      );
      setIsEnrolled(!!active);
      if (active) {
        setEnrollmentId(active.enrollment_id);
        setStudentName(active.full_name || session.user.email || "");
      }

      if (courseId) {
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", session.user.id)
          .eq("course_id", courseId);

        if (progress) setCompletedLessons(new Set(progress.map((p: any) => p.lesson_id)));
      }
    };
    init();
  }, [courseId]);

  useEffect(() => {
    if (courseData && courseData.modules.length > 0 && courseData.modules[0].lessons.length > 0) {
      setExpandedModule(courseData.modules[0].id);
      setActiveLesson({ moduleId: courseData.modules[0].id, lessonId: courseData.modules[0].lessons[0].id });
    }
  }, [courseData]);

  const toggleComplete = useCallback(async (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });

    if (!userId || !courseId) return;

    const isCompleted = completedLessons.has(lessonId);

    if (isCompleted) {
      await supabase
        .from("lesson_progress")
        .delete()
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .eq("lesson_id", lessonId);
    } else {
      await supabase
        .from("lesson_progress")
        .insert({ user_id: userId, course_id: courseId, lesson_id: lessonId });
    }
  }, [userId, courseId, completedLessons]);

  if (!courseData) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-primary hover:underline">← Back to Courses</Link>
        </div>
      </Layout>
    );
  }

  if (isEnrolled === null) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="animate-pulse text-muted-foreground">Checking enrollment...</div>
        </div>
      </Layout>
    );
  }

  if (isEnrolled === false) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-24 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Enrollment Required</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            You need to be enrolled to access course content. Enroll now or sign in to continue learning.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/courses/enroll"><Button>Enroll Now</Button></Link>
            <Link to="/auth"><Button variant="outline">Sign In</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  const totalLessons = courseData.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const progressPercent = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;

  const currentLesson = activeLesson
    ? courseData.modules.find(m => m.id === activeLesson.moduleId)?.lessons.find(l => l.id === activeLesson.lessonId)
    : null;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/courses")}>
                  <ArrowLeft size={18} />
                </Button>
                <div>
                  <h1 className="text-lg font-bold">{courseData.title}</h1>
                  <p className="text-xs text-muted-foreground">{completedLessons.size} of {totalLessons} lessons completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-48">
                <Progress value={progressPercent} className="h-2" />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{Math.round(progressPercent)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card overflow-y-auto lg:h-[calc(100vh-145px)]">
            <div className="p-4 space-y-1">
              {courseData.modules.map((mod, mi) => (
                <div key={mod.id}>
                  <button
                    onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{mi + 1}</span>
                      {mod.title}
                    </span>
                    {expandedModule === mod.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {expandedModule === mod.id && (
                    <div className="ml-8 space-y-0.5 pb-2">
                      {mod.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson({ moduleId: mod.id, lessonId: lesson.id })}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors ${
                            activeLesson?.lessonId === lesson.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {completedLessons.has(lesson.id) ? (
                            <CheckCircle size={12} className="text-primary shrink-0" />
                          ) : lesson.type === "video" ? (
                            <Play size={12} className="shrink-0" />
                          ) : (
                            <FileText size={12} className="shrink-0" />
                          )}
                          <span className="text-left flex-1">{lesson.title}</span>
                          <span className="text-[10px] text-muted-foreground">{lesson.duration}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto lg:h-[calc(100vh-145px)]">
            {currentLesson ? (
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 lg:p-10 max-w-4xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="secondary" className="text-[10px]">
                    {currentLesson.type === "video" ? <><Play size={10} className="mr-1" /> Video</> : <><FileText size={10} className="mr-1" /> Reading</>}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={10} /> {currentLesson.duration}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-6">{currentLesson.title}</h2>

                {currentLesson.type === "video" && currentLesson.videoUrl && (
                  <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                    <iframe
                      src={currentLesson.videoUrl}
                      title={currentLesson.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                  {currentLesson.content.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) return <h3 key={i} className="text-lg font-semibold mt-6 mb-2">{line.slice(3)}</h3>;
                    if (line.startsWith("- **")) {
                      const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
                      return match ? <p key={i} className="ml-4 mb-1"><strong>{match[1]}</strong>{match[2] ? `: ${match[2]}` : ""}</p> : <p key={i}>{line}</p>;
                    }
                    if (line.startsWith("- ")) return <p key={i} className="ml-4 mb-1">• {line.slice(2)}</p>;
                    if (line.startsWith("```")) return null;
                    if (line.trim() === "") return <br key={i} />;
                    return <p key={i} className="mb-2 text-muted-foreground leading-relaxed">{line}</p>;
                  })}
                </div>

                {/* Quiz */}
                {currentLesson.quiz && (
                  <QuizComponent
                    title={currentLesson.quiz.title}
                    questions={currentLesson.quiz.questions}
                    courseId={courseId || ""}
                    lessonId={currentLesson.id}
                  />
                )}

                {/* Assignment */}
                {currentLesson.assignment && (
                  <AssignmentComponent
                    title={currentLesson.assignment.title}
                    description={currentLesson.assignment.description}
                    tasks={currentLesson.assignment.tasks}
                    courseId={courseId || ""}
                    enrollmentId={enrollmentId}
                    studentName={studentName}
                    studentEmail={studentEmail}
                  />
                )}

                <div className="flex items-center gap-4 border-t border-border pt-6 mt-6">
                  <Button
                    onClick={() => toggleComplete(currentLesson.id)}
                    variant={completedLessons.has(currentLesson.id) ? "default" : "outline"}
                    className="gap-2"
                  >
                    <CheckCircle size={16} />
                    {completedLessons.has(currentLesson.id) ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="mx-auto mb-3 h-10 w-10" />
                  <p>Select a lesson to start learning</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseContent;
