import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, LogOut, ArrowLeft, Upload, Video } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  video_url: string | null;
  read_time: string;
  published: boolean;
  created_at: string;
  author_name: string;
  author_role: string;
}

const emptyPost = {
  title: "", excerpt: "", content: "", category: "",
  image_url: "", video_url: "", read_time: "5 min read",
  published: false, author_name: "DTEN Media", author_role: "Media & Social Team",
};

const BlogAdmin = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data: roleData } = await supabase
        .from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      if (!roleData) { toast({ title: "Access denied", variant: "destructive" }); setIsAdmin(false); return; }
      setIsAdmin(true);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { if (!session) navigate("/auth"); });
    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  useEffect(() => { if (isAdmin) fetchPosts(); }, [isAdmin]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("blog-admin", { body: { action: "list" } });
      if (error) throw error;
      if (data) setPosts(data);
    } catch (err) { console.error("Failed to fetch posts", err); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("blog-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(path);
      setEditing({ ...editing, image_url: publicUrl });
      toast({ title: "Image uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    if (file.size > 500 * 1024 * 1024) {
      toast({ title: "Video too large", description: "Max 500MB allowed.", variant: "destructive" });
      return;
    }
    setUploadingVideo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("blog-videos").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("blog-videos").getPublicUrl(path);
      setEditing({ ...editing, video_url: publicUrl });
      toast({ title: "Video uploaded!" });
    } catch (err: any) {
      toast({ title: "Video upload failed", description: err.message, variant: "destructive" });
    } finally { setUploadingVideo(false); }
  };

  const handleSave = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const payload = {
        title: editing.title!, excerpt: editing.excerpt!, content: editing.content!,
        category: editing.category!, image_url: editing.image_url || null,
        video_url: editing.video_url || null, read_time: editing.read_time || "5 min read",
        published: editing.published ?? false, author_name: editing.author_name || "Darryl Thompson",
        author_role: editing.author_role || "CEO & Founder",
      };
      const { error } = await supabase.functions.invoke("blog-admin", {
        body: { action: editing.id ? "update" : "create", id: editing.id, ...payload },
      });
      if (error) throw error;
      toast({ title: editing.id ? "Post updated!" : "Post created!" });
      setEditing(null); fetchPosts();
    } catch (err: any) {
      toast({ title: "Error saving post", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const { error } = await supabase.functions.invoke("blog-admin", { body: { action: "delete", id } });
      if (error) throw error;
      toast({ title: "Post deleted" }); fetchPosts();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/auth"); };

  if (isAdmin === null) {
    return <Layout><section className="container mx-auto flex min-h-[60vh] items-center justify-center px-6 py-24"><p className="text-muted-foreground">Checking access...</p></section></Layout>;
  }
  if (isAdmin === false) {
    return <Layout><section className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center"><h2 className="mb-4 text-2xl font-bold">Access Denied</h2><Button onClick={handleLogout} variant="outline">Sign Out</Button></section></Layout>;
  }

  if (editing) {
    return (
      <Layout>
        <section className="container mx-auto px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-2xl font-bold">{editing.id ? "Edit Post" : "New Post"}</h2>
            <div className="space-y-5">
              <div><Label>Title</Label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. News, Updates, Tech" /></div>
              <div><Label>Excerpt</Label><Textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} /></div>
              <div><Label>Content</Label><Textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={10} /></div>
              
              {/* Cover Image */}
              <div>
                <Label>Cover Image</Label>
                <div className="mt-1 flex gap-3">
                  <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="Paste URL or upload" className="flex-1" />
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? "Uploading..." : <><Upload size={14} className="mr-1" /> Upload</>}
                  </Button>
                </div>
                {editing.image_url && <div className="mt-3 overflow-hidden rounded-lg border border-border"><img src={editing.image_url} alt="Preview" className="h-40 w-full object-cover" /></div>}
              </div>

              {/* Video Upload */}
              <div>
                <Label>Video (optional, max 500MB)</Label>
                <div className="mt-1 flex gap-3">
                  <Input value={editing.video_url || ""} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} placeholder="Paste URL or upload" className="flex-1" />
                  <input type="file" ref={videoInputRef} accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo}>
                    {uploadingVideo ? "Uploading..." : <><Video size={14} className="mr-1" /> Upload</>}
                  </Button>
                </div>
                {editing.video_url && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-border">
                    <video src={editing.video_url} controls className="h-40 w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Read Time</Label><Input value={editing.read_time || ""} onChange={(e) => setEditing({ ...editing, read_time: e.target.value })} /></div>
                <div><Label>Author</Label><Input value={editing.author_name || ""} onChange={(e) => setEditing({ ...editing, author_name: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editing.published ?? false} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
                <Label>Published</Label>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container mx-auto px-6 py-24">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-muted-foreground hover:text-primary transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-3xl font-bold">Blog Admin</h1>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setEditing({ ...emptyPost })}><Plus size={16} className="mr-1" /> New Post</Button>
            <Button variant="outline" onClick={handleLogout}><LogOut size={16} /></Button>
          </div>
        </div>
        <div className="space-y-4">
          {posts.length === 0 && <p className="py-10 text-center text-muted-foreground">No posts yet. Create your first post!</p>}
          {posts.map((post) => (
            <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {post.image_url && <img src={post.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    {post.video_url && <Video size={14} className="text-primary shrink-0" />}
                    {post.published ? <span className="shrink-0 rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">Published</span> : <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Draft</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{post.category} · {post.read_time}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setEditing(post)}><Edit2 size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)}><Trash2 size={14} /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default BlogAdmin;
