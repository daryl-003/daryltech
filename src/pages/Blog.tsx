import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Settings, ArrowUpRight } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSplash from "@/components/AnimatedSplash";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  read_time: string;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, category, image_url, read_time, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    };

    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
        if (roleData) setIsAdmin(true);
      }
    };

    fetchPosts();
    checkAdmin();
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const filteredPosts = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);
  const [featured, ...rest] = filteredPosts;

  return (
    <Layout>
      {/* Cinematic Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <AnimatedSplash intensity="medium" />
        <div className="container relative mx-auto px-6 py-24 md:py-32">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <p className="mb-3 text-sm font-mono uppercase tracking-widest text-primary">— Journal</p>
              <h1 className="mb-4 text-5xl font-bold leading-[1.05] md:text-7xl">
                Ideas, essays & <span className="text-gradient">field notes.</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Long-form thinking on technology, product, and the practice of building software in Africa and beyond.
              </p>
            </motion.div>
            {isAdmin && (
              <Link to="/blog/admin" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                <Settings size={16} /> Manage Blog
              </Link>
            )}
          </div>

          {/* Category filter */}
          {!loading && categories.length > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-12 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                    activeCategory === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 py-20">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-96 animate-pulse rounded-xl border border-border bg-card" />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            <p className="text-lg">No posts published yet.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link to={`/blog/${featured.id}`}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="group mb-20 grid gap-8 rounded-xl border border-border bg-card overflow-hidden lg:grid-cols-2 hover:border-primary/50 transition-all"
                >
                  {featured.image_url && (
                    <div className="relative overflow-hidden lg:h-full h-64">
                      <img src={featured.image_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <p className="mb-4 text-xs font-mono uppercase tracking-widest text-primary">Featured · {featured.category}</p>
                    <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl group-hover:text-primary transition-colors">{featured.title}</h2>
                    <p className="mb-6 text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(featured.created_at)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {featured.read_time}</span>
                      <span className="ml-auto inline-flex items-center gap-1 font-mono uppercase tracking-widest text-primary">
                        Read <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            )}

            {/* Grid of remaining posts */}
            {rest.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <Link key={post.id} to={`/blog/${post.id}`}>
                    <motion.article
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:-translate-y-1"
                    >
                      {post.image_url && (
                        <div className="relative overflow-hidden">
                          <img src={post.image_url} alt={post.title} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-primary">{post.category}</p>
                        <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="mb-4 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.created_at)}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {post.read_time}</span>
                          <ArrowUpRight size={14} className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};

export default Blog;
