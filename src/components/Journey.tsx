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
    highlight: true
  }
];

export function Journey() {
  return (
    <section id="journey" className="py-40 px-6 relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Column: Title & Progress (Non-sticky) */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-primary font-mono text-xs font-bold uppercase tracking-[0.4em]">Chronology</span>
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-none">
                  Engineering<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40">Journey</span>
                </h2>
              </div>
              
              <p className="text-muted-foreground font-sans text-lg max-w-sm leading-relaxed">
                The evolution of a problem solver: from hardware precision to full-stack architecture.
              </p>

              <div className="hidden lg:block pt-12 relative">
                <div className="text-[12rem] font-display font-black text-white/[0.02] absolute -left-12 -top-12 leading-none select-none pointer-events-none">
                  PATH
                </div>
                <div className="space-y-4">
                  {journey.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 group cursor-default">
                      <div className={`h-1 transition-all duration-500 rounded-full ${item.highlight ? "w-12 bg-primary" : "w-4 bg-white/10 group-hover:w-8 group-hover:bg-primary/50"}`} />
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${item.highlight ? "text-primary" : "text-white/20 group-hover:text-white/50"}`}>
                        {item.year.split(" — ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Timeline Cards */}
          <div className="lg:col-span-8 relative">
            {/* Main Timeline Line */}
            <div className="absolute left-0 lg:left-6 top-8 bottom-8 w-px bg-gradient-to-b from-primary/50 via-primary/5 to-transparent" />

            <div className="space-y-16">
              {journey.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative pl-12 lg:pl-24 group"
                >
                  {/* Node Dot */}
                  <div className="absolute left-[-5.5px] lg:left-[0.5px] top-8 z-10 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full transition-all duration-500 scale-100 group-hover:scale-150 ${item.highlight ? "bg-primary shadow-[0_0_15px_rgba(20,184,166,0.8)]" : "bg-white/20 group-hover:bg-primary"}`} />
                    {item.highlight && (
                      <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping opacity-40" />
                    )}
                  </div>

                  {/* Year Indicator (Desktop only floating) */}
                  <div className="absolute left-0 lg:left-[-140px] top-7 hidden lg:block w-32 text-right">
                    <span className={`text-xs font-mono font-bold tracking-tighter transition-colors duration-500 ${item.highlight ? "text-primary" : "text-white/10 group-hover:text-white/40"}`}>
                      {item.year}
                    </span>
                  </div>

                  <div className={`glass-card p-8 lg:p-10 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 relative group-hover:border-primary/20 ${item.highlight ? "border-primary/20 bg-primary/[0.02]" : ""}`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-widest border border-primary/20">
                            {item.phase}
                          </span>
                          <span className="lg:hidden text-[10px] font-mono text-muted-foreground font-bold">
                            {item.year}
                          </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-white group-hover:text-primary transition-colors duration-500">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground font-sans text-sm md:text-lg leading-relaxed max-w-2xl">
                          {item.description}
                        </p>
                      </div>

                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${item.highlight ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(20,184,166,0.2)]" : "bg-white/5 text-primary/40 group-hover:bg-primary/20 group-hover:text-primary"}`}>
                        {item.icon}
                      </div>
                    </div>

                    {/* Technical Accent Decorative */}
                    <div className="absolute bottom-4 right-6 flex gap-1 items-end h-4 pointer-events-none opacity-20">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1 bg-white" style={{ height: `${i * 4}px` }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
