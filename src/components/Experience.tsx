'use client';

import Image from "next/image";
import { useState } from "react";
import { Briefcase, MapPin, Lightning, ArrowUpRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/Reveal";
import { projects, ProjectDetails } from "@/data/projects";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";

export function Experience() {
  const [openId, setOpenId] = useState<string | null>(null);

  // Filter career projects for Xgenious (excluding personal project NexDrop)
  const careerProjects = projects.filter((p) => p.id !== "nexdrop");
  const openProject = projects.find((p) => p.id === openId) || null;

  return (
    <section id="experience" className="relative overflow-hidden border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <Reveal className="mb-16 flex flex-col gap-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold">
            Career record
          </span>
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-6xl">
            Where I work.
          </h2>
        </Reveal>

        {/* Company card */}
        <Reveal y={40}>
          <div className="mb-14 overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm md:p-10">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 dark:border-zinc-800 bg-neutral-100 dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium tracking-tight text-foreground">Xgenious</h3>
                    <div className="mt-1 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                      <Lightning className="h-3.5 w-3.5 text-indigo-500" /> Frontend Developer
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1.5 font-sans normal-case">
                    <MapPin className="h-3.5 w-3.5" /> Dhaka, BD
                  </span>
                  <span className="hidden h-3 w-px bg-border sm:block" />
                  <span>Jul 2025 — Present</span>
                </div>
              </div>

              <p className="max-w-3xl leading-relaxed text-muted-foreground">
                I develop SaaS and commercial web applications using Next.js, React, TypeScript and
                Tailwind — collaborating with backend engineers to ship production-ready features and
                scalable architectures.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Projects */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {careerProjects.map((p, idx) => (
            <Reveal key={p.id} y={40} delay={idx * 0.08}>
              <button
                onClick={() => setOpenId(p.id)}
                className="group relative block h-[380px] w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all duration-500 hover:border-foreground/20 cursor-pointer"
              >
                <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover object-top transition-transform duration-750 ease-out group-hover:scale-103"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50 dark:to-zinc-900" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    {p.category}
                  </span>
                  <h4 className="mt-1 text-2xl font-medium tracking-tight text-foreground">{p.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {p.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 font-semibold">
                    View case <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Shared Unified Project Detail Modal */}
      <ProjectDetailsModal
        project={openProject}
        onClose={() => setOpenId(null)}
        onNavigate={(p) => setOpenId(p.id)}
      />
    </section>
  );
}
