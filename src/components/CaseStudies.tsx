'use client';

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, GithubLogo, Globe } from "@phosphor-icons/react";

const personalProjects = [
  {
    title: "Project Alpha",
    desc: "A creative exploration into generative art and autonomous SVG animations using specialized algorithms.",
    tags: ["Personal", "Generative Art", "Creative Coding"],
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    link: "#",
    span: "md:col-span-8",
    height: "h-[500px]"
  },
  {
    title: "NeuroTrack",
    desc: "Personal health dashboard for tracking cognitive load and productivity trends.",
    tags: ["HealthTech", "Dashboard"],
    img: "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2670&auto=format&fit=crop",
    link: "#",
    span: "md:col-span-4",
    height: "h-[500px]"
  },
  {
    title: "Zenith OS",
    desc: "Experiential web-based operating system mockup focused on hyper-minimalism.",
    tags: ["Experimental", "UI/UX"],
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop",
    link: "#",
    span: "md:col-span-4",
    height: "h-[450px]"
  },
  {
    title: "Aura Commerce",
    desc: "A concept high-end luxury e-commerce platform with cinematic transitions.",
    tags: ["E-commerce", "Framer Motion"],
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop",
    link: "#",
    span: "md:col-span-8",
    height: "h-[450px]"
  }
];

export function CaseStudies() {
  return (
    <section id="projects" className="py-40 px-6 container max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="mb-24 space-y-4 text-center md:text-left"
      >
        <span className="text-primary text-xs font-bold uppercase tracking-[0.4em]">Personal Labs</span>
        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Case <span className="text-primary">Studies</span></h2>
        <p className="text-muted-foreground text-lg max-w-xl">Deep dives into my personal ventures, open-source projects, and experimental engineering labs.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {personalProjects.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`${p.span} ${p.height} relative group rounded-[3rem] overflow-hidden glass-card border-white/5 cursor-pointer`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110"
              style={{
                backgroundImage: `url('${p.img}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-500" />
            </div>

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-10 lg:p-14 flex flex-col justify-end h-full">
              <div className="flex gap-3 mb-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                {p.tags.map(tag => (
                  <Badge key={tag} className="bg-primary text-black font-bold border-none px-4 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 group-hover:text-primary transition-colors duration-300">
                {p.title}
              </h3>
              <p className="text-white/60 font-sans text-sm md:text-lg max-w-xl line-clamp-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100">
                {p.desc}
              </p>
            </div>

            {/* Links Corner */}
            <div className="absolute top-10 right-10 flex gap-3 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <a href={p.link} className="w-12 h-12 rounded-2xl glass border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
                <GithubLogo size={20} />
              </a>
              <a href={p.link} className="w-12 h-12 rounded-2xl glass border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
                <Globe size={20} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
