import { motion } from "framer-motion";
import { Linkedin, Twitter, Github, Mail, Phone, Globe, Award, Users, Briefcase, TrendingUp, Brain, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSplash from "@/components/AnimatedSplash";
import teamCollabImg from "@/assets/team-collab.jpg";
import officeImg from "@/assets/office-workspace.jpg";
import ceoDarrylImg from "@/assets/ceo-darryl.jpg";
import mayaChenImg from "@/assets/maya-chen.jpg";
import kwameAsanteImg from "@/assets/kwame-asante.jpg";

const team = [
  {
    name: "Darryl Thompson",
    role: "Founder & CEO",
    bio: "15+ years in tech leadership. Former engineering lead at a Fortune 500 company. Visionary behind Daryl Tech's mission to democratize technology.",
    specialties: ["Strategy", "Architecture", "AI"],
    image: ceoDarrylImg,
    socials: { linkedin: "https://www.linkedin.com/company/daryl-tech-educational-network", twitter: "https://x.com/daryl_tech?s=21", github: "https://github.com/daryl-tech003", email: "darryl@daryltech.com" },
  },
  {
    name: "Sasu Safnant Panea",
    role: "Projects Manager/Facilitator",
    bio: "Highly skilled projects manager with years of experience in facilitating. Certified projects manager.",
    specialties: ["Cybersecurity", "AI", "Consulting"],
    image: mayaChenImg,
    socials: { linkedin: "https://linkedin.com", twitter: "https://twitter.com", github: "https://github.com", email: "sasu@darrylstech.com" },
  },
  {
    name: "Osei Nyamekye Chris",
    role: "CO-Founder",
    bio: "React & TypeScript specialist. Open-source contributor with 5K+ GitHub stars. Tech community builder.",
    specialties: ["React", "TypeScript", "Open Source"],
    image: kwameAsanteImg,
    socials: { linkedin: "https://linkedin.com", twitter: "https://twitter.com", github: "https://github.com", email: "kwame@darrylstech.com" },
  },
  {
    name: "Ahmed-Alfa Rashid",
    role: "Marketing Team Lead",
    bio: "Lead Marketing with experience in penetrating testing, vulnerability assessment and content marketing.",
    specialties: ["Cybersecurity", "Content Marketing", "Open Source", "TypeScript"],
    image: kwameAsanteImg,
    socials: { linkedin: "https://linkedin.com", twitter: "https://twitter.com", github: "https://github.com", email: "tikkie@darrylstech.com" },
  },
  {
    name: "Carlos Rivera",
    role: "Security Lead",
    bio: "Cybersecurity expert with CISSP certification. Specializes in penetration testing and compliance frameworks.",
    specialties: ["Pentesting", "Compliance", "Security"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    socials: { linkedin: "https://linkedin.com", github: "https://github.com", email: "carlos@darrylstech.com" },
  },
  {
    name: "Aisha Williams",
    role: "AI/ML Engineer",
    bio: "Machine learning engineer with a PhD in Computer Science. Builds intelligent systems that drive real business value.",
    specialties: ["TensorFlow", "NLP", "Data Science"],
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face",
    socials: { linkedin: "https://linkedin.com", twitter: "https://twitter.com", github: "https://github.com", email: "aisha@darrylstech.com" },
  },
];

const values = [
  { icon: Award, title: "Innovation First", desc: "We push boundaries and embrace emerging technologies to deliver forward-thinking solutions." },
  { icon: Users, title: "Client Partnership", desc: "We work alongside you — not just for you. Your success is our success." },
  { icon: TrendingUp, title: "Quality Obsessed", desc: "Every line of code, every design pixel, every interaction is crafted with care." },
  { icon: Briefcase, title: "Transparent Always", desc: "No hidden costs, no surprises. Clear communication at every stage." },
];

const milestones = [
  { year: "2024", event: "Daryl Tech & Educational Network founded in Tarkwa, Ghana" },
  { year: "2024", event: "First enterprise client —  contract" },
  { year: "2024", event: "Expanded to 15 team members" },
  { year: "2025", event: "Launched AI & Automation division, focused on youth and young women in technology" },
  { year: "2025", event: "30th project delivered, opened head office, Accra" },
  { year: "2026", event: "Launched an internship programme for young and passionate students" },
  { year: "2026", event: "30+ team members, serving clients globally" },
  { year: "2026", event: "Introduced Internship opportunities for tertiary students & high schoolers"},
  { year: "2026", event: "Introduced an awareness program on cybersecurity and AI"}
];

const About = () => {
  return (
    <Layout>
      {/* Hero with image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={teamCollabImg} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        <AnimatedSplash intensity="soft" />
        <div className="container relative mx-auto px-6 py-28 md:py-36">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">About Us</p>
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">
                We're <span className="text-gradient">Daryl Tech & Educational Network</span>
              </h1>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2024, Daryl Tech & Educational Network began with a simple mission: make world-class technology accessible to businesses of all sizes.
                </p>
                <p>
                  Today, we're a team of 15+ engineers, designers, and strategists delivering solutions across web, mobile, cloud, cybersecurity, and AI — while empowering learners through our tech education programs.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop"
                    alt="Team work"
                    className="rounded-xl border border-border object-cover w-full h-40"
                    loading="lazy"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=400&fit=crop"
                    alt="Brainstorming"
                    className="rounded-xl border border-border object-cover w-full h-52"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-3 pt-8">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop"
                    alt="Meeting"
                    className="rounded-xl border border-border object-cover w-full h-52"
                    loading="lazy"
                  />
                  <img
                    src={officeImg}
                    alt="Office"
                    className="rounded-xl border border-border object-cover w-full h-40"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Our Journey</p>
            <h2 className="text-3xl font-bold md:text-4xl">Key Milestones</h2>
          </motion.div>
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`relative mb-8 flex items-center gap-6 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-primary glow-border" />
                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <span className="text-sm font-mono font-bold text-primary">{m.year}</span>
                  <p className="text-sm text-muted-foreground">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Our Values</p>
          <h2 className="text-3xl font-bold md:text-4xl">What Drives Us</h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover-glow"
            >
              <v.icon className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-3 text-lg font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CEO Feature */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-5 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="relative">
                <img
                  src={ceoDarrylImg}
                  alt="Stephen Darryl Osei Boateng Junior - FOUNDER"
                  className="rounded-xl border border-border w-full object-cover h-[400px]"
                />
                <div className="absolute -bottom-4 -right-4 rounded-lg bg-gradient-primary px-5 py-3">
                  <p className="text-xs font-mono font-bold text-primary-foreground">EST. 2024</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Leadership</p>
              <h2 className="mb-2 text-3xl font-bold md:text-4xl">Stephen Darryl Osei Boateng Junior</h2>
              <p className="mb-6 text-sm font-mono text-primary">Founder & Chief Executive Officer</p>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                With over 5 years of experience in technology leadership, Darryl founded Daryl Tech & Educational Network as a subset of Daryls Tech LLC with a vision to bridge the gap between cutting-edge technology and everyday business needs. His background includes engineering leadership roles at Fortune 500 companies, where he led teams of 50+ engineers building mission-critical systems.
              <p className="mb-8 text-muted-foreground leading-relaxed">
                Under his guidance, Daryls Tech has delivered 10+ projects, generating over $50M in client revenue. Darryl is also a keynote speaker at major tech conferences and an advisor to multiple startups.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mb-8">
                <a href="mailto:darryl@daryltech.com" className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  <Mail size={16} className="text-primary" /> darrylshub@gmail.com
                </a>
                <a href="tel:233550007171" className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  <Phone size={16} className="text-primary" /> +233 (550) 007-171
                </a>
                <a href="https://darylstech.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  <Globe size={16} className="text-primary" /> darylstech.com
                </a>
                <div className="flex gap-2">
                  {[
                    { icon: Linkedin, href: "https://www.linkedin.com/company/daryl-tech-educational-network" },
                    { icon: Twitter, href: "https://x.com/daryl_tech?s=21" },
                    { icon: Github, href: "https://github.com/daryl-003" },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 flex-1 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary"
                    >
                      <s.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About the Website / What We Do / Core Values */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-3xl"
        >
          <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Our Foundation</p>
          <h2 className="mb-4 text-3xl font-bold md:text-5xl leading-tight">
            More than a website — a <span className="text-gradient">launchpad</span> for Africa's next tech generation.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Daryl Tech & Educational Network is where world-class engineering meets community-driven learning. Whether you are hiring us to build production software or enrolling in our academy, everything on this site is built to move you forward.
          </p>
        </motion.div>

        {/* About the Website */}
        <div className="mb-16 grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8"
          >
            <p className="mb-3 text-xs font-mono uppercase tracking-widest text-primary">/ About the Website</p>
            <h3 className="mb-4 text-2xl font-bold">A single hub for services, learning, and career growth.</h3>
            <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
              This platform brings together our consulting practice and our education network under one roof. Clients can commission projects, browse our portfolio, and book calls. Learners can enrol in certified courses,apply for internships, submit assignments, chat with our AI mentor Jael, and track progress in a personal dashboard.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built with modern, responsive engineering — realtime notifications, secure payments in Ghanaian Cedi, and role-based dashboards for students, staff and administrators.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8"
          >
            <p className="mb-3 text-xs font-mono uppercase tracking-widest text-primary">/ What We Do</p>
            <h3 className="mb-4 text-2xl font-bold">Two practices, one mission.</h3>
            <ul className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <Briefcase size={18} className="mt-0.5 shrink-0 text-primary" />
                <span><strong className="text-foreground">Consulting & Delivery.</strong> Web platforms, mobile apps, cloud infrastructure, AI automation, cybersecurity, etc for businesses across West Africa.</span>
              </li>
              <li className="flex gap-3">
                <Users size={18} className="mt-0.5 shrink-0 text-primary" />
                <span><strong className="text-foreground">Academy & Internships.</strong> Certified courses taught by working engineers, live-project internships, and career support that turns learners into shippers.</span>
              </li>
              <li className="flex gap-3">
                <TrendingUp size={18} className="mt-0.5 shrink-0 text-primary" />
                <span><strong className="text-foreground">Community & Advisory.</strong> Speaking, mentorship, and open-source contribution to strengthen the wider Ghanaian tech ecosystem.</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Core Values expanded */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="mb-2 text-xs font-mono uppercase tracking-widest text-primary">/ Core Values</p>
          <h3 className="text-3xl font-bold md:text-4xl">The principles behind every project and every lesson.</h3>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Award, title: "Excellence as Standard", desc: "We treat production code and classroom material with the same craft — no shortcuts, no filler." },
            { icon: Users, title: "People Before Product", desc: "Clients are partners; students are colleagues in training. We invest in relationships, not transactions." },
            { icon: Globe, title: "Built in Africa, for the World", desc: "We are proudly Ghanaian and globally competitive. Our work reflects both roots and ambition." },
            { icon: Brain, title: "Learn Relentlessly", desc: "Technology moves fast. We upskill weekly, share what we learn, and hire the curious." },
            { icon: Shield, title: "Integrity & Transparency", desc: "Clear scopes, honest timelines, plain pricing. What we promise is what we ship." },
            { icon: TrendingUp, title: "Impact Over Vanity", desc: "We measure success by careers changed and businesses moved forward — not likes or logos." },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover-glow"
            >
              <v.icon className="mb-4 h-7 w-7 text-primary" />
              <h4 className="mb-2 text-lg font-semibold">{v.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Office Gallery */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-sm font-mono uppercase tracking-widest text-primary">Our Space</p>
            <h2 className="text-3xl font-bold md:text-4xl">Where Innovation Happens</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: officeImg, alt: "Tech workspace", span: "col-span-2 row-span-2" },
              { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop", alt: "Open office", span: "" },
              { src: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&h=300&fit=crop", alt: "Meeting room", span: "" },
              { src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop", alt: "Whiteboard session", span: "" },
              { src: teamCollabImg, alt: "Team collaboration", span: "" },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`overflow-hidden rounded-xl border border-border ${img.span}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
