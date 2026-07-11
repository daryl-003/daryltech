import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2, BookOpen, Save, FileText, Play, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { COURSE_MODULES } from "@/data/courseModules";

const COURSE_OPTIONS = Object.keys(COURSE_MODULES).map(k => ({
  id: k, title: COURSE_MODULES[k].title,
}));

type Lesson = {
  id: string; module_id: string; title: string; type: string;
  duration: string; content: string; video_url: string | null; position: number;
  quiz: any; assignment: any;
};
type ModuleRow = {
  id: string; course_id: string; title: string; position: number;
  lessons: Lesson[];
};

const AdminCourseCMS = () => {
  const { toast } = useToast();
  const [courseId, setCourseId] = useState<string>(COURSE_OPTIONS[0]?.id || "");
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const load = async () => {
    if (!courseId) return;
    setLoading(true);
    const { data: mods } = await supabase
      .from("course_modules").select("*")
      .eq("course_id", courseId).order("position");
    const ids = (mods || []).map(m => m.id);
    let lessonsByModule: Record<string, Lesson[]> = {};
    if (ids.length) {
      const { data: lessons } = await supabase
        .from("course_lessons").select("*").in("module_id", ids).order("position");
      (lessons || []).forEach((l: any) => {
        (lessonsByModule[l.module_id] ||= []).push(l);
      });
    }
    setModules((mods || []).map((m: any) => ({ ...m, lessons: lessonsByModule[m.id] || [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("course_modules").insert({
      course_id: courseId, title: newModuleTitle.trim(),
      position: modules.length, created_by: session?.user.id,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewModuleTitle("");
    toast({ title: "Module added" });
    load();
  };

  const deleteModule = async (id: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    const { error } = await supabase.from("course_modules").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Module removed" });
    load();
  };

  const addLesson = async (moduleId: string, position: number) => {
    const { data, error } = await supabase.from("course_lessons").insert({
      module_id: moduleId, title: "New Lesson", type: "text",
      duration: "10 min", content: "", position,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setEditingLesson(data as any);
    load();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("course_lessons").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (editingLesson?.id === id) setEditingLesson(null);
    load();
  };

  const saveLesson = async () => {
    if (!editingLesson) return;
    const { id, module_id, ...updates } = editingLesson;
    const { error } = await supabase.from("course_lessons").update(updates).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Lesson saved" });
    setEditingLesson(null);
    load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen size={16} /> Course Content Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px]">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_OPTIONS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <Label>New Module Title</Label>
              <div className="flex gap-2">
                <Input
                  value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  placeholder="e.g. Introduction to React"
                />
                <Button onClick={addModule}><Plus size={14} className="mr-1" /> Add</Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : modules.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No modules yet. The course will fall back to default content until you add modules here.
            </p>
          ) : (
            <div className="space-y-2">
              {modules.map((mod, mi) => (
                <motion.div key={mod.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border">
                  <div className="flex items-center justify-between px-3 py-2 hover:bg-muted/50">
                    <button
                      className="flex items-center gap-2 text-left flex-1"
                      onClick={() => setExpanded(e => ({ ...e, [mod.id]: !e[mod.id] }))}
                    >
                      {expanded[mod.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <Badge variant="secondary" className="text-xs">M{mi + 1}</Badge>
                      <span className="text-sm font-medium">{mod.title}</span>
                      <span className="text-xs text-muted-foreground">({mod.lessons.length} lessons)</span>
                    </button>
                    <Button size="sm" variant="ghost" onClick={() => addLesson(mod.id, mod.lessons.length)}>
                      <Plus size={14} className="mr-1" /> Lesson
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteModule(mod.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  {expanded[mod.id] && (
                    <div className="border-t border-border bg-muted/30 px-3 py-2 space-y-1">
                      {mod.lessons.length === 0 && (
                        <p className="py-2 text-center text-xs text-muted-foreground">No lessons yet.</p>
                      )}
                      {mod.lessons.map(l => (
                        <div key={l.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-background">
                          {l.type === "video" ? <Play size={12} /> : <FileText size={12} />}
                          <span className="text-xs flex-1">{l.title}</span>
                          <span className="text-[10px] text-muted-foreground">{l.duration}</span>
                          {l.quiz && <Badge variant="outline" className="text-[9px]">Quiz</Badge>}
                          {l.assignment && <Badge variant="outline" className="text-[9px]">Assignment</Badge>}
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditingLesson(l)}>Edit</Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteLesson(l.id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingLesson && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Lesson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label>Title</Label>
                <Input value={editingLesson.title} onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })} />
              </div>
              <div>
                <Label>Duration</Label>
                <Input value={editingLesson.duration} onChange={e => setEditingLesson({ ...editingLesson, duration: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={editingLesson.type} onValueChange={v => setEditingLesson({ ...editingLesson, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingLesson.type === "video" && (
                <div className="md:col-span-2">
                  <Label>Video Embed URL</Label>
                  <Input
                    value={editingLesson.video_url || ""}
                    onChange={e => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Content (Markdown supported)</Label>
              <Textarea
                rows={8}
                value={editingLesson.content}
                onChange={e => setEditingLesson({ ...editingLesson, content: e.target.value })}
                placeholder="Lesson content..."
              />
            </div>
            <div>
              <Label>Quiz JSON (optional)</Label>
              <Textarea
                rows={5}
                value={editingLesson.quiz ? JSON.stringify(editingLesson.quiz, null, 2) : ""}
                onChange={e => {
                  try {
                    const v = e.target.value.trim();
                    setEditingLesson({ ...editingLesson, quiz: v ? JSON.parse(v) : null });
                  } catch { /* ignore parse errors while typing */ }
                }}
                placeholder='{ "title": "Quiz", "questions": [{"question":"...","options":["A","B"],"correctIndex":0,"explanation":"..."}] }'
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label>Assignment JSON (optional)</Label>
              <Textarea
                rows={4}
                value={editingLesson.assignment ? JSON.stringify(editingLesson.assignment, null, 2) : ""}
                onChange={e => {
                  try {
                    const v = e.target.value.trim();
                    setEditingLesson({ ...editingLesson, assignment: v ? JSON.parse(v) : null });
                  } catch { /* ignore */ }
                }}
                placeholder='{ "title": "Build a layout", "description": "...", "tasks": ["task 1","task 2"] }'
                className="font-mono text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveLesson}><Save size={14} className="mr-1" /> Save Lesson</Button>
              <Button variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCourseCMS;
