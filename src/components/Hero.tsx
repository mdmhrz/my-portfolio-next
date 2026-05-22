'use client';

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any },
    },
  };

  const techStack = [
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextdotjs" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Node.js", slug: "nodedotjs" },
    { name: "PostgreSQL", slug: "postgresql" },
    { name: "Tailwind CSS", slug: "tailwindcss" },
    { name: "Docker", slug: "docker" },
    { name: "Prisma", slug: "prisma" },
    { name: "Redux", slug: "redux" },
    { name: "MongoDB", slug: "mongodb" }
  ];

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-screen flex items-center pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 space-y-10"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary backdrop-blur-sm shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em]">Available for hire</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-7xl xl:text-8xl font-display font-bold text-white leading-[0.9] tracking-tighter"
              >
                Mobarak<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40 leading-tight">Hossain Razu</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg md:text-xl text-muted-foreground font-sans max-w-xl leading-relaxed"
              >
                Full Stack Developer crafting scalable SaaS platforms and immersive digital experiences. Engineering the bridge between complex systems and intuitive design.
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-5 pt-4">
              <Button className="h-14 px-10 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:scale-105 transition-all shadow-[0_0_25px_rgba(20,184,166,0.2)] active:scale-95 group">
                View Projects <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" className="h-14 px-10 rounded-xl border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-base hover:bg-white/10 transition-all active:scale-95">
                Contact Me
              </Button>

              <button className="flex items-center gap-2 text-primary font-mono text-sm font-bold hover:underline transition-all group pt-2 sm:pt-0">
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> 
                <span className="tracking-tight">Download Resume</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as any, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative group">
              <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
              
              <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-3xl overflow-hidden glass-card p-2 border-primary/20 shadow-2xl">
                <img 
                  alt="Mobarak Hossain Razu Professional Profile" 
                  className="w-full h-full object-cover rounded-2xl filter grayscale contrast-[1.1] brightness-[0.9] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-out scale-105 group-hover:scale-100" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJCpg_SFwOpUUGthFh9V8ICzXll5sUJL31lRDEGanh7tYGi11O26R_3vVfRF3fcAYs3khGLFDfekeRuckUSLZeRBnlEPAedeC8wGZwnN69Zf_KNbFUmSEURyCLXd_WWxLnpbMFXvl-Zoubnb6C5LCqiYNwU_WIpsviH3KGqmDFl3suW8ykLxgO1MLiQDwfx975-L-hT9rOc1dxkyKJlEe7tDXg86NZzf7xbbjPaM77tVjp8F6FDNxX1tLI-Y92W-am9-eB6tpk7WE" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-6 left-6 right-6 p-5 glass-card border-white/10 backdrop-blur-2xl bg-black/60 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest leading-none">Role</span>
                      <span className="block text-sm font-bold text-primary leading-tight">Frontend Dev @ Xgenious</span>
                    </div>
                    
                    <div className="flex -space-x-2">
                      {["TS", "RT", "NX"].map((tech) => (
                        <div key={tech} className="w-9 h-9 rounded-full bg-background border border-white/10 flex items-center justify-center text-[10px] font-bold shadow-lg hover:-translate-y-1 transition-transform cursor-help">
                          {tech}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <div className="py-12 bg-muted/30 border-y border-white/5 overflow-hidden backdrop-blur-sm relative z-10">
        <div className="marquee-track flex items-center">
          {[...techStack, ...techStack].map((tech, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 px-12 group/tech cursor-default"
            >
              <img 
                src={`https://cdn.simpleicons.org/${tech.slug}/ffffff`} 
                alt={`${tech.name} logo`}
                className="w-8 h-8 opacity-40 group-hover/tech:opacity-100 group-hover/tech:brightness-125 transition-all duration-300 filter grayscale group-hover/tech:grayscale-0"
              />
              <span className="text-xs md:text-sm font-mono font-bold tracking-[0.3em] text-primary/40 whitespace-nowrap group-hover/tech:text-primary transition-colors">
                {tech.name.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
