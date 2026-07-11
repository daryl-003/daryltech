import { useEffect, useState } from "react";
import { Sparkles, Upload, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const KEYS = { avatar: "jael_avatar_url", button: "jael_button_url" };

export default function AdminAIAssetsManager() {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [buttonUrl, setButtonUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"avatar" | "button" | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("key,value").in("key", [KEYS.avatar, KEYS.button]);
      data?.forEach((r: any) => {
        if (r.key === KEYS.avatar) setAvatarUrl(r.value);
        if (r.key === KEYS.button) setButtonUrl(r.value);
      });
    })();
  }, []);

  const upload = async (which: "avatar" | "button", file: File) => {
    setBusy(which);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${which}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("ai-assets").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("ai-assets").getPublicUrl(path);
      const key = which === "avatar" ? KEYS.avatar : KEYS.button;
      const { error: dbErr } = await supabase.from("app_settings").upsert({ key, value: pub.publicUrl, updated_at: new Date().toISOString() });
      if (dbErr) throw dbErr;
      if (which === "avatar") setAvatarUrl(pub.publicUrl); else setButtonUrl(pub.publicUrl);
      toast({ title: "Updated", description: `Jael ${which} image updated.` });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const Slot = ({ label, url, which }: { label: string; url: string | null; which: "avatar" | "button" }) => (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted flex items-center justify-center">
        {url ? <img src={url} alt={label} className="h-full w-full object-cover" /> : <Sparkles size={20} className="text-muted-foreground" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{url ? "Custom image set" : "Using default"}</p>
      </div>
      <label className="cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(which, e.target.files[0])} disabled={busy === which} />
        <span className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          {busy === which ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload
        </span>
      </label>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Sparkles size={16} /> Jael AI Assistant Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Slot label="Conversation Avatar" url={avatarUrl} which="avatar" />
        <Slot label="Floating Chat Button" url={buttonUrl} which="button" />
      </CardContent>
    </Card>
  );
}
