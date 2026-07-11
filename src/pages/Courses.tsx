import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Users, Star, BookOpen, Code, Cloud, Shield, Brain, Smartphone, Monitor, LogIn, Briefcase, CreditCard, Loader2, Award, CheckCircle, Heart, FileSpreadsheet, Flag  } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSplash from "@/components/AnimatedSplash";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ghanaStudentsImg from "@/assets/ghana-students-lab.jpg";

const courses = [
  { 
    id: "web-dev", 
    icon: Code,
    title: "Full-Stack Web Development", 
    desc: "Master React, Node.js, databases, and deployment. Build production-ready apps from scratch.", 
    duration: "12 Weeks", 
    students: "50+", 
    rating: "4.1", 
    level: "Beginner to Advanced", 
    price: "Free", 
    internship: true 
  },
  { 
    id: "mobile-dev",
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Learn React Native and Flutter to build cross-platform mobile applications.",
    duration: "10 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Intermediate",
    price: "Free",
    internship: true
  },
  { 
    id: "cloud-eng",
    icon: Cloud,
    title: "Cloud Engineering & DevOps",
    desc: "AWS, Azure, Docker, Kubernetes, CI/CD pipelines, and infrastructure as code.",
    duration: "14 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Intermediate to Advanced", 
    price: "GH₵10,990", 
    internship: false 
  },
  { 
    id: "cybersecurity",
    icon: Shield,
    title: "Cybersecurity Fundamentals",
    desc: "Ethical hacking, penetration testing, network security, and compliance frameworks.",
    duration: "10 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Beginner to Intermediate",
    price: "Free",
    internship: true
  },
  { 
    id: "ai-ml",
    icon: Brain,
    title: "AI & Machine Learning",
    desc: "Python, TensorFlow, neural networks, NLP, and real-world AI project deployment.",
    duration: "16 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Intermediate to Advanced",
    price: "GH₵8,750", 
    internship: true 
  },
  {
    id: "it-support",
    icon: Monitor,
    title: "IT Support & Administration",
    desc: "CompTIA A+ prep, networking, troubleshooting, and enterprise system administration.",
    duration: "8 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Beginner",
    price: "Free",
    internship: true 
  },
  {
    id: "Data-science-analytics",
    icon: CheckCircle,
    title: "Data Science & Analytics",
    desc: "Kaggle, Google Colab, jupyter-lab, pytorch and azure ml.",
    duration: "8 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Beginner",
    price: "Free",
    internship: true
  },
  {
    id: "introduction-to-linux",
    icon: Heart,
    title: "Introduction to Linux Based Systems",
    desc: "VM workstation, VirtualBox, Dabian, and Ubuntu.",
    duration: "8 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Beginner",
    price: "Free",
    internship: true
  },
  {
    id: "introduction-to-python",
    icon: Flag,
    title: "Introduction to Python",
    desc: "Python, open-sourse.",
    duration: "10 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Beginner",
    price: "Free",
    internship: true
  },
  {
    id: "introduction-to-react-tsx-js",
    icon: Award,
    title: "Introduction to React, Typescript and Javascript",
    desc: "React, TypeScript and JavaScript.",
    duration: "10 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Beginner",
    price: "Free",
    internship: true
  },
  {
    id: "dbm & ms",
    icon: Code,
    title: "Database Management & Management Systems",
    desc: "Kaggle, Google Colab, jupyter-lab, and azure ml.",
    duration: "8 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Beginner",
    price: "Free",
    internship: true
  },
  {
    id: "excel",
    icon: FileSpreadsheet,
    title: "Introduction to Excel",
    desc: "Excel basics, data science, and programming.",
    duration: "8 Weeks",
    students: "50+",
    rating: "4.0",
    level: "Beginner",
    price: "Free",
    internship: true
  },
  { id: "networking", 
    icon: Brain, 
    title: "Networking & Systems Administration", 
    desc: "Networking basics, networking tools, system admin, Troubleshooting,lab works.", 
    duration: "10 Weeks", 
    students: "50+", 
    rating: "4.0", 
    level: "Beginner", 
    price: "Free", 
    internship: true 
  },
];

const Courses = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleCheckout = async (courseId: string) => {
    setCheckingOut(courseId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { courseId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Checkout Error", description: err.message, variant: "destructive" });
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0">
          <img src={ghanaStudentsImg} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <AnimatedSplash intensity="soft" />
        <div className="container relative mx-auto px-6 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="mb-3 text-sm font-mono uppercase tracking-widest text-primary">
              <BookOpen className="mr-2 inline h-4 w-4" /> Academy
            </p>
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
              Level Up Your <span className="text-gradient">Tech Skills</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Industry-leading courses taught by professionals with real-world experience. Get certified, access internships, and launch your tech career.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/courses/enroll" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
                    Enroll Now <ArrowRight size={16} />
                  </Link>
                  <Link to="/courses/verify" className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">
                    Verify Enrollment
                  </Link>
                </>
              ) : (
                <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
                  <LogIn size={16} /> Sign In to Get Started
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="container mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Programs</p>
          <h2 className="text-3xl font-bold md:text-4xl">Available Courses & Internships</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group flex flex-col rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover-glow"
            >
              <div className="mb-4 flex items-center justify-between">
                <course.icon className="h-10 w-10 text-primary" />
                {course.internship && (
                  <Link to="/courses/enroll" className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors">
                    <Briefcase size={10} /> Apply for Internship
                  </Link>
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                <Link to={`/courses/${course.id}/learn`} className="hover:text-primary transition-colors">{course.title}</Link>
              </h3>
              <p className="mb-6 flex-1 text-sm text-muted-foreground leading-relaxed">{course.desc}</p>
              <div className="mb-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock size={12} /> {course.duration}</span>
                <span className="flex items-center gap-1.5"><Users size={12} /> {course.students}</span>
                <span className="flex items-center gap-1.5"><Star size={12} /> {course.rating}</span>
                <span className="flex items-center gap-1.5"><BookOpen size={12} /> {course.level}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-2xl font-bold text-gradient">{course.price}</span>
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1 text-xs"
                      disabled={checkingOut === course.id}
                      onClick={() => handleCheckout(course.id)}
                    >
                      {checkingOut === course.id ? (
                        <><Loader2 size={12} className="animate-spin" /> Processing...</>
                      ) : (
                        <><CreditCard size={12} /> Pay & Enroll</>
                      )}
                    </Button>
                    <Link to="/courses/enroll" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
                      Free Enroll <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <Link to="/auth" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Sign In <LogIn size={14} />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Internship Section */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary"><Briefcase className="mr-1 inline h-4 w-4" /> Career Opportunities</p>
            <h2 className="text-3xl font-bold md:text-4xl">Internship <span className="text-gradient">Program</span></h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Top-performing students get access to internship placements with our partner companies. Gain real-world experience while learning.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Placement Assistance", desc: "We connect you with tech companies looking for skilled interns in your field of study." },
              { title: "Mentorship Program", desc: "Get paired with industry professionals who guide your career development and growth." },
              { title: "Certificate & Recommendation", desc: "Receive internship certificates and recommendation letters upon successful completion." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-background p-6"
              >
                <Briefcase className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="mt-10 text-center">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
                <LogIn size={16} /> Sign In to Access Internships
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Auth CTA for non-authenticated */}
      {isAuthenticated === false && (
        <section className="bg-background">
          <div className="container mx-auto px-6 py-20 text-center">
            <LogIn className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-4 text-3xl font-bold">
              Ready to <span className="text-gradient">Start Learning</span>?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
              Create an account or sign in to enroll in courses, access internship opportunities, submit tasks, and verify your enrollment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
                Sign Up / Sign In <ArrowRight size={16} />
              </Link>
              <Link to="/booking" className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">
                Book a Free Consultation
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA for authenticated */}
      {isAuthenticated && (
        <section className="bg-background">
          <div className="container mx-auto px-6 py-20 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Not Sure Which Course to <span className="text-gradient">Choose</span>?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
              Book a free consultation and our team will help you find the perfect learning path.
            </p>
            <Link to="/booking" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
              Book a Free Consultation <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Courses;
