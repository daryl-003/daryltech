import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type QuizComponentProps = {
  title: string;
  questions: QuizQuestion[];
  courseId?: string;
  lessonId?: string;
};

const QuizComponent = ({ title, questions, courseId, lessonId }: QuizComponentProps) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const score = submitted
    ? questions.reduce((s, q, i) => s + (answers[i] === q.correctIndex ? 1 : 0), 0)
    : 0;

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!courseId || !lessonId) return;
    const computed = questions.reduce((s, q, i) => s + (answers[i] === q.correctIndex ? 1 : 0), 0);
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: session.user.id,
        course_id: courseId,
        lesson_id: lessonId,
        score: computed,
        max_score: questions.length,
        answers: answers as any,
      });
      if (error) throw error;
      toast({ title: "Quiz saved", description: `Score: ${computed}/${questions.length}` });
    } catch (err: any) {
      console.warn("quiz save failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 my-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {submitted && (
          <Badge variant={score === questions.length ? "default" : "secondary"}>
            {score}/{questions.length} correct
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <p className="text-sm font-medium">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = submitted && oi === q.correctIndex;
                const isWrong = submitted && selected && oi !== q.correctIndex;

                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors text-left ${
                      isCorrect
                        ? "border-primary bg-primary/10 text-primary"
                        : isWrong
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {submitted && isCorrect && <CheckCircle size={12} className="shrink-0 text-primary" />}
                    {submitted && isWrong && <XCircle size={12} className="shrink-0 text-destructive" />}
                    {!submitted && (
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                    )}
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="text-[11px] text-muted-foreground mt-1 ml-1">
                💡 {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        {!submitted ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length || saving}
          >
            {saving ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={reset} className="gap-1">
            <RotateCcw size={12} /> Retake
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
