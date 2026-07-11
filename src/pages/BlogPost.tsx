import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  video_url: string | null;
  read_time: string;
  created_at: string;
  author_name: string;
  author_role: string;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-32">
          <div className="mx-auto max-w-3xl animate-pulse space-y-6">
            <div className="h-8 w-3/4 rounded bg-card" />
            <div className="h-64 rounded-xl bg-card" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-card" />
              <div className="h-4 w-5/6 rounded bg-card" />
              <div className="h-4 w-4/6 rounded bg-card" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-6 py-32">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">Post Not Found</h2>
            <p className="mb-6 text-muted-foreground">This blog post doesn't exist or has been unpublished.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft size={14} /> Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-3 text-xs font-mono uppercase tracking-wider text-primary">{post.category}</p>
            <h1 className="mb-6 text-3xl font-bold leading-tight md:text-5xl">{post.title}</h1>

            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User size={14} /> {post.author_name}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(post.created_at)}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {post.read_time}</span>
            </div>

            {post.image_url && (
              <div className="mb-10 overflow-hidden rounded-xl border border-border">
                <img src={post.image_url} alt={post.title} className="w-full object-cover" />
              </div>
            )}

            {post.video_url && (
              <div className="mb-10 overflow-hidden rounded-xl border border-border">
                <video src={post.video_url} controls className="w-full" />
              </div>
            )}

            <div
              className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
