'use client';

import { motion } from "motion/react";
import { Settings, Briefcase, School, Layers, Rocket } from "lucide-react";

const journey = [
  {
    year: "2018 — 2021",
    phase: "FOUNDATION",
    title: "Mechanical Engineering",
    description: "Diploma Foundations. Understanding precision, systems, and hardware architecture before shifting to software.",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    year: "2021 — 2022",
    phase: "BUSINESS",
    title: "Tech Business Venture",
    description: "Entrepreneurial phase. Learning the market needs and how digital products solve real-world business challenges.",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    year: "2022 — 2023",
    phase: "EVOLUTION",
    title: "Self-Taught Dev Phase",
    description: "Deep dive into documentation, open source, and building 100+ small-scale components.",
    icon: <School className="w-5 h-5" />,
  },
  {
    year: "2023 — 2024",
    phase: "MASTERY",
    title: "MERN Stack Transition",
    description: "Mastering Full-stack capabilities with Node, Express, React, and MongoDB. Building complex state-driven apps.",
    icon: <Layers className="w-5 h-5" />,
  },
  {
    year: "2024 — PRESENT",
    phase: "IMPACT",
    title: "SaaS Engineering Era",
    description: "Focusing on scalability, performance optimization, and professional engineering standards at Xgenious.",
    icon: <Rocket className="w-5 h-5" />,
    highlight: true,
    tags: ["SaaS", "Scalability", "Performance"],
  }
];

export function Journey() {
  return (
    <section id="journey" className="py-40 px-6 relative bg-background border-y border-border">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          
          {/* Left Column: Sticky Title & Progress */}
          <div className="lg:col-span-4 lg:sticky lg:top-40 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-4">
                <span className="text-primary text-xs font-bold uppercase tracking-[0.4em]">Chronology</span>
                <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-none tracking-tighter">
                  Engineering <br /> <span className="text-primary">Journey</span>
                </h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                A timeline of technical evolution, from initial curiosity to scaling complex enterprise systems.
              </p>

              {/* Progress Indicator */}
              <div className="hidden lg:block space-y-6 pt-10">
                {journey.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${item.highlight ? "bg-primary scale-150 shadow-[0_0_10px_rgba(20,184,166,0.5)]" : "bg-muted-foreground group-hover:bg-muted-foreground/60"}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${item.highlight ? "text-primary" : "text-muted-foreground group-hover:text-muted-foreground/70"}`}>
                      {item.year.split(" — ")[0]} – {item.phase}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Stacking Sticky Cards */}
          <div className="lg:col-span-8 flex flex-col gap-[10vh] lg:gap-0">
            {journey.map((item, idx) => (
              <div 
                key={idx} 
                className="lg:sticky lg:pb-32"
                style={{ 
                  top: `${160 + (idx * 40)}px`,
                  zIndex: idx + 1 
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="text-[10rem] font-black text-foreground/[0.02] absolute -left-12 -top-12 leading-none select-none pointer-events-none">
                    {item.year.split(" — ")[0]}
                  </div>

                  <div className="glass-card p-8 md:p-12 bg-muted hover:bg-muted/80 backdrop-blur-3xl shadow-2xl transition-all duration-500 border-border group-hover:border-primary/20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl bg-primary/10 border border-primary/20 transition-transform duration-500 group-hover:rotate-[360deg]`}>
                          {item.icon}
                        </div>
                        <span className={`text-xs font-bold tracking-tighter transition-colors duration-500 ${item.highlight ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground/70"}`}>
                          {item.year}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.tags?.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="lg:hidden text-[10px] text-muted-foreground font-bold">
                        {item.year}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-500">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {item.description}
                      </p>
                    </div>

                    {/* Technical Accent Decorative */}
                    <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Engineering Milestone</span>
                      <div className="flex gap-1 items-end h-4 pointer-events-none opacity-20">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1 bg-foreground" style={{ height: `${i * 4}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
