'use client';

import { Settings, Code2, Rocket, Briefcase, Boxes } from "lucide-react";
import { Reveal } from "@/components/Reveal";

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

export function Journey() {
  return (
    <section id="journey" className="relative border-y border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: title (sticky on desktop) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
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
                <p className="mt-6 max-w-xs leading-relaxed text-muted-foreground">
                  From mechanical engineering to production web — a timeline of how the stack came together.
                </p>
              </Reveal>

              <Reveal delay={0.15} className="mt-10 hidden flex-col gap-4 lg:flex">
                {journey.map((item) => (
                  <div key={item.year} className="flex items-center gap-3">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.highlight ? "bg-foreground" : "bg-muted-foreground/40"}`}
                    />
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {item.year}
                    </span>
                  </div>
                ))}
              </Reveal>
            </div>
          </div>

          {/* Right: stacking sticky cards */}
          <div className="flex flex-col gap-6 lg:col-span-8 lg:gap-0">
            {journey.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.year}
                  y={40}
                  className="lg:sticky lg:ml-auto lg:w-[94%] lg:pb-8"
                  style={{ top: `${128 + idx * 36}px` }}
                >
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm transition-colors duration-500 hover:border-foreground/20 md:p-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-foreground/[0.03] text-foreground transition-transform duration-500 group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                            {item.phase}
                          </span>
                          <h3 className="mt-1 text-xl font-medium tracking-tight text-foreground md:text-2xl">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium tracking-tight text-muted-foreground">
                        {item.year}
                      </span>
                    </div>

                    <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>

                    {item.tags && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border bg-foreground/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground"
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
