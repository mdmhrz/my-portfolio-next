'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Pin the left column
      ScrollTrigger.create({
        trigger: leftColRef.current,
        start: "top 160px",
        end: () => `+=${containerRef.current?.offsetHeight ? containerRef.current.offsetHeight - window.innerHeight : 0}`,
        pin: true,
        pinSpacing: false,
      });

      // Animate cards on scroll
      cardsRef.current.forEach((card) => {
        if (!card) return;
        
        gsap.fromTo(card,
          { opacity: 0, y: 100, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 60%",
              scrub: 0.5,
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);
  return (
    <section ref={containerRef} id="journey" className="py-40 px-6 relative bg-background border-y border-border">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start relative">
          
          {/* Left Column: Sticky Title & Progress */}
          <div ref={leftColRef} className="lg:col-span-4 lg:h-fit">
            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <span className="text-foreground/50 text-xs font-bold uppercase tracking-[0.4em]">Chronology</span>
                <h2 className="text-5xl md:text-7xl font-black text-foreground leading-[0.9] tracking-tighter uppercase">
                  Engineering <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground/80 to-foreground/30">Journey</span>
                </h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                A timeline of technical evolution, from initial curiosity to scaling complex enterprise systems.
              </p>

              {/* Progress Indicator */}
              <div className="hidden lg:block space-y-6 pt-10">
                {journey.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${item.highlight ? "bg-foreground scale-150 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-none" : "bg-muted-foreground group-hover:bg-muted-foreground/60"}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${item.highlight ? "text-foreground" : "text-muted-foreground group-hover:text-muted-foreground/70"}`}>
                      {item.year.split(" — ")[0]} – {item.phase}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Stacking Sticky Cards */}
          <div className="lg:col-span-8 flex flex-col gap-[10vh] lg:gap-0 mt-10 lg:mt-0">
            {journey.map((item, idx) => (
              <div 
                key={idx} 
                ref={el => { if (el) cardsRef.current[idx] = el; }}
                className="lg:sticky lg:pb-32 lg:w-[92%] lg:ml-auto"
                style={{ 
                  top: `${160 + (idx * 40)}px`,
                  zIndex: idx + 1 
                }}
              >
                <div className="group relative">
                  <div className="glass-card relative overflow-hidden p-8 md:p-12 bg-card dark:!bg-[#181818] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-all duration-500 border-border dark:!border-white/[0.12] group-hover:border-foreground/20">
                    {/* Background Year Watermark */}
                    <div className="text-[8rem] md:text-[14rem] font-black text-foreground/[0.03] absolute -bottom-8 -right-4 md:-bottom-12 md:-right-8 leading-none select-none pointer-events-none transition-all duration-700 group-hover:scale-105 group-hover:text-foreground/[0.05]">
                      {item.year.split(" — ")[0]}
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl bg-foreground/5 border border-border transition-transform duration-500 group-hover:rotate-[360deg]`}>
                          {item.icon}
                        </div>
                        <span className={`text-xs font-bold tracking-tighter transition-colors duration-500 ${item.highlight ? "text-foreground" : "text-muted-foreground/40 group-hover:text-muted-foreground/70"}`}>
                          {item.year}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.tags?.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-foreground/5 text-foreground text-[10px] font-bold uppercase tracking-widest border border-border">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="lg:hidden text-[10px] text-muted-foreground font-bold">
                        {item.year}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter transition-colors duration-500">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {item.description}
                      </p>
                    </div>

                    {/* Technical Accent Decorative */}
                    <div className="relative z-10 mt-12 pt-8 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Engineering Milestone</span>
                      <div className="flex gap-1 items-end h-4 pointer-events-none opacity-20">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1 bg-foreground" style={{ height: `${i * 4}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
