import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AssignmentComponentProps = {
  title: string;
  description: string;
  tasks: string[];
  courseId?: string;
  enrollmentId?: string | null;
  studentName?: string;
  studentEmail?: string;
};

const AssignmentComponent = ({
  title,
  description,
  tasks,
  courseId,
  enrollmentId,
  studentName,
  studentEmail,
}: AssignmentComponentProps) => {
  const [response, setResponse] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!enrollmentId || !studentEmail) {
      toast({
        title: "Enrollment required",
        description: "We couldn't find an active paid enrollment for your account.",
        variant: "destructive",
      });
      return;
    }
    if (!file && response.trim().length < 10) {
      toast({ title: "Add a response or attach a file", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      let fileUrl = "";
      let fileName = "text-response.txt";

      if (file) {
        const path = `${enrollmentId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("task-submissions")
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        fileUrl = path;
        fileName = file.name;
      } else {
        const blob = new Blob([response], { type: "text/plain" });
        const path = `${enrollmentId}/${Date.now()}-response.txt`;
        const { error: upErr } = await supabase.storage
          .from("task-submissions")
          .upload(path, blob, { upsert: false });
        if (upErr) throw upErr;
        fileUrl = path;
      }

      const { error: insErr } = await supabase.from("task_submissions").insert({
        enrollment_id: enrollmentId,
        student_name: studentName || studentEmail,
        student_email: studentEmail,
        course: courseId || "general",
        task_title: title,
        description: response || description,
        file_url: fileUrl,
        file_name: fileName,
        status: "pending",
      });
      if (insErr) throw insErr;

      setSubmitted(true);
      toast({ title: "Assignment submitted", description: "Your instructor will review it." });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 my-6">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <ClipboardList size={16} className="text-primary" />
        <h3 className="text-lg font-bold">{title}</h3>
        <Badge variant="outline" className="text-[10px]">Assignment</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      <div className="mb-4 space-y-1.5">
        <p className="text-xs font-medium">Tasks:</p>
        {tasks.map((task, i) => (
          <p key={i} className="text-xs text-muted-foreground ml-3">
            {i + 1}. {task}
          </p>
        ))}
      </div>

      {!submitted ? (
        <>
          <Textarea
            placeholder="Write your answer or notes here..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={5}
            className="text-sm mb-3"
          />
          <label className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <Upload size={14} /> Attach file (optional)
          </label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-3 text-xs"
          />
          <Button size="sm" onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Submitting..." : "Submit Assignment"}
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2 text-primary text-sm">
          <CheckCircle size={16} />
          <span>Assignment submitted! Your instructor will review it.</span>
        </div>
      )}
    </div>
  );
};

export default AssignmentComponent;
