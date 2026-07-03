'use client';

import { useRef, useState, useEffect } from "react";
import { Settings, Code2, Rocket, Briefcase, Boxes } from "lucide-react";
import { Reveal } from "@/components/global/Reveal";
import { useScroll, motion } from "motion/react";

const journey = [
  {
    year: "2010 — 2014",
    phase: "Foundation",
    title: "Diploma in Mechanical Engineering",
    description:
      "Bangladesh Sweden Polytechnic Institute, Rangamati. A grounding in precision, systems, and structured problem-solving before software.",
    icon: Settings,
  },
  {
    year: "2021 — 2024",
    phase: "Transition",
    title: "Self-taught Web Development",
    description:
      "Picked up JavaScript, React and the MERN stack — building full-stack apps and shipping real projects end to end.",
    icon: Code2,
  },
  {
    year: "2024 — 2025",
    phase: "Full-stack builds",
    title: "Shipping Production Apps",
    description:
      "Built NexDrop — a full-stack parcel-delivery platform with role-based dashboards, payments, and Docker-on-AWS deployment.",
    icon: Rocket,
    highlight: true,
    tags: ["Next.js", "Node.js", "AWS"],
  },
  {
    year: "Jul 2025 — Present",
    phase: "Xgenious",
    title: "Frontend Developer",
    description:
      "Building SaaS & commercial apps (Taskip, ReportGenix) with Next.js, React and TypeScript. Led a multi-tenancy architecture migration.",
    icon: Briefcase,
    highlight: true,
    tags: ["Next.js", "TypeScript", "SaaS"],
  },
  {
    year: "Now",
    phase: "Expanding",
    title: "Backend, Go & DevOps",
    description:
      "Deepening backend architecture, picking up Go for services, and refining cloud & CI/CD workflows.",
    icon: Boxes,
  },
];

export function Journey({ profile }: { profile?: any }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  useEffect(() => {
    const handleScroll = () => {
      const cardElements = journey.map((_, idx) => document.getElementById(`journey-card-${idx}`));
      const viewportMiddle = window.innerHeight / 2;

      let currentActive = 0;
      let minDistance = Infinity;

      cardElements.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportMiddle);
        if (distance < minDistance) {
          minDistance = distance;
          currentActive = idx;
        }
      });

      setActiveIndex(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCard = (idx: number) => {
    const el = document.getElementById(`journey-card-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative border-t border-border bg-background px-6 py-28 md:py-40"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* Left: title (sticky on desktop) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <span className="text-xs font-semibold text-primary dark:text-primary">
                  Chronology
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-4 text-4xl font-medium leading-[0.95] tracking-tight text-foreground md:text-6xl">
                  The path
                  <br />
                  so far.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {profile?.bio || "From mechanical engineering to production web — a timeline of how the stack came together."}
                </p>
              </Reveal>

              {/* Stepper Index Navigation */}
              <Reveal delay={0.15} className="mt-10 hidden flex-col gap-4 lg:flex">
                {journey.map((item, idx) => (
                  <button
                    key={item.year}
                    onClick={() => scrollToCard(idx)}
                    className="flex items-center gap-3 text-left group cursor-pointer w-fit select-none"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 group-hover:scale-125 ${
                        idx === activeIndex
                          ? "bg-primary dark:bg-primary scale-125"
                          : "bg-muted-foreground/40 group-hover:bg-muted-foreground"
                      }`}
                    />
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      idx === activeIndex
                        ? "text-foreground font-bold"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {item.year}
                    </span>
                  </button>
                ))}
              </Reveal>
            </div>
          </div>

          {/* Right: stacking sticky cards */}
          <div className="relative flex flex-col gap-6 lg:col-span-8 lg:gap-0">
            
            {/* Vertical timeline line (desktop only) */}
            <div className="absolute left-[3%] top-[40px] bottom-[80px] hidden w-[4px] lg:block overflow-visible">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 2 100" preserveAspectRatio="none">
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="100"
                  className="stroke-neutral-200 dark:stroke-zinc-800/60"
                  strokeWidth="2"
                />
                <motion.line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="100"
                  className="stroke-primary dark:stroke-primary"
                  strokeWidth="2"
                  style={{ 
                    pathLength: scrollYProgress,
                    filter: "drop-shadow(0 0 4px color-mix(in oklch, var(--primary) 50%, transparent))"
                  }}
                />
              </svg>
            </div>

            {journey.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.year}
                  y={40}
                  className="lg:sticky lg:ml-auto lg:w-[94%] lg:pb-8"
                  style={{ top: `${128 + idx * 36}px` }}
                >
                  <div
                    id={`journey-card-${idx}`}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm transition-colors duration-500 hover:border-foreground/20 md:p-10"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary dark:text-primary transition-transform duration-500 group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3.5">
                            <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-muted-foreground/80">
                              {item.phase}
                            </span>
                            {item.highlight && (
                              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 dark:bg-primary/15 px-2.5 py-0.5 text-[9px] font-sans font-bold text-primary dark:text-primary select-none uppercase tracking-wider">
                                <span className="h-1 w-1 rounded-full bg-primary dark:bg-primary animate-pulse" />
                                Milestone
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1.5 text-xl font-medium tracking-tight text-foreground md:text-2xl">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium tracking-tight text-muted-foreground">
                        {item.year}
                      </span>
                    </div>

                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>

                    {item.tags && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-primary/10 dark:border-primary/15 bg-primary/[0.04] dark:bg-primary/[0.04] px-3 py-1 text-[10px] font-sans tracking-wider text-primary dark:text-primary font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
