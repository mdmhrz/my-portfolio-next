'use client';

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/global/Reveal";
import { ProjectDetails } from "@/data/projects";
import { ProjectDetailsModal } from "./ProjectDetailsModal";
import { motion } from "motion/react";

import { mapDbProjectToProjectDetails } from "@/lib/utils";

export function CaseStudies({ projects: dbProjects }: { projects?: any[] }) {
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);

  // Featured case studies are flagged from the CMS (Project.featured === true).
  const featuredDb = (dbProjects ?? []).filter((p: any) => p.featured).slice(0, 2);
  const featured = featuredDb.map(mapDbProjectToProjectDetails);

  // Full list used for the details modal navigation.
  const projectsList = (dbProjects ?? []).map(mapDbProjectToProjectDetails);

  return (
    <section id="work" className="relative border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <Reveal className="mb-14 flex flex-col gap-4">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Selected work
          </span>
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-6xl">
            Things I&apos;ve shipped.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {featured.map((p, i) => {
            const cardSpan = i === 0 ? "lg:col-span-7" : "lg:col-span-5";

            return (
              <Reveal key={p.title} y={40} delay={i * 0.08} className={cardSpan}>
                <div
                  onClick={() => setSelectedProject(p)}
                  data-cursor-text="VIEW"
                  className="group relative flex h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 hover:border-foreground/25 hover:shadow-md md:h-[580px] cursor-pointer"
                >
                  {/* App window frame mockup */}
                  <div className="relative shrink-0 overflow-hidden border-b border-border bg-neutral-100/30 dark:bg-zinc-950/40">
                    {/* Window chrome header */}
                    <div className="flex items-center gap-2 px-5 py-3">
                      <span className="h-2 w-2 rounded-full bg-foreground/10" />
                      <span className="h-2 w-2 rounded-full bg-foreground/10" />
                      <span className="h-2 w-2 rounded-full bg-foreground/10" />
                      <span className="ml-3 truncate font-mono text-xs text-muted-foreground/60">
                        {p.live.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                    {/* Screenshot Container */}
                    <div className="relative h-[220px] w-full overflow-hidden md:h-[260px]">
                      <motion.div
                        layoutId={`project-image-${p.id}`}
                        className="absolute inset-0"
                      >
                        <Image
                          src={p.image}
                          alt={p.imageAlt || p.title}
                          fill
                          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </motion.div>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* Content description panel */}
                  <div className="flex flex-1 flex-col p-7 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-2.5 flex flex-wrap gap-1.5">
                          {/* We use tags for high-level highlights */}
                          {p.category.split("·").map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-neutral-200 dark:border-zinc-700 bg-neutral-100 dark:bg-zinc-950 px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-xs font-mono text-muted-foreground">{p.subtitle}</p>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-zinc-700 text-foreground transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-indigo-600 dark:group-hover:border-indigo-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {p.desc}
                    </p>

                    {/* Primary Tech Badges footer */}
                    <div className="mt-auto pt-6">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border/80 pt-4">
                        {p.tech.slice(0, 6).map((t, idx) => (
                          <span key={t} className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground/80">
                              {t}
                            </span>
                            {idx < Math.min(p.tech.length, 6) - 1 && (
                              <span className="h-1 w-1 rounded-full bg-indigo-500/80" />
                            )}
                          </span>
                        ))}
                        {p.tech.length > 6 && (
                          <span className="font-mono text-xs text-muted-foreground/40">
                            +{p.tech.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Project Detail Modal */}
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onNavigate={setSelectedProject}
          allProjects={projectsList}
        />
      </div>
    </section>
  );
}
