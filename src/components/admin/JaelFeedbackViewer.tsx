import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Feedback = {
  id: string;
  rating: "up" | "down";
  question: string | null;
  answer: string;
  created_at: string;
};

export default function JaelFeedbackViewer() {
  const { toast } = useToast();
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "up" | "down">("down");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("jael_feedback").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("rating", filter);
    const { data, error } = await q;
    if (error) toast({ title: "Failed to load feedback", description: error.message, variant: "destructive" });
    setItems((data as Feedback[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("jael_feedback").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const upCount = items.filter((i) => i.rating === "up").length;
  const downCount = items.filter((i) => i.rating === "down").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare size={16} /> Jael Conversation Feedback
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1"><ThumbsUp size={12} /> {upCount}</Badge>
          <Badge variant="secondary" className="gap-1"><ThumbsDown size={12} /> {downCount}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          {(["down", "up", "all"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "up" ? "Helpful" : "Needs work"}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No feedback yet.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {items.map((it) => (
              <div key={it.id} className="rounded-lg border border-border p-3 bg-muted/20">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {it.rating === "up" ? (
                      <ThumbsUp size={14} className="text-primary" />
                    ) : (
                      <ThumbsDown size={14} className="text-destructive" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(it.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(it.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
                {it.question && (
                  <p className="text-xs font-medium text-foreground mb-1">
                    <span className="text-muted-foreground">Q:</span> {it.question}
                  </p>
                )}
                <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  <span className="font-medium text-foreground">A:</span> {it.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
