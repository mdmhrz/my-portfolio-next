'use client';

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight, Folder, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { projects, ProjectDetails } from "@/data/projects";

interface ProjectDetailsModalProps {
  project: ProjectDetails | null;
  onClose: () => void;
  onNavigate?: (project: ProjectDetails) => void;
  allProjects?: ProjectDetails[];
}

export function ProjectDetailsModal({ project, onClose, onNavigate, allProjects }: ProjectDetailsModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Reset scroll position to top when navigating to a new project
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [project?.id]);

  if (typeof window === "undefined") return null;

  // Find the next/prev project in the list to cycle through
  const projectsList = allProjects || projects;
  const currentIdx = project ? projectsList.findIndex((p) => p.id === project.id) : -1;
  const nextProject = currentIdx !== -1 ? projectsList[(currentIdx + 1) % projectsList.length] : null;
  const prevProject = currentIdx !== -1 ? projectsList[(currentIdx - 1 + projectsList.length) % projectsList.length] : null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 35, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.985 }}
          transition={{ type: "spring", damping: 28, stiffness: 200 }}
          className="fixed inset-0 z-[100000] overflow-y-auto overscroll-contain bg-background"
          data-lenis-prevent="true"
        >
          {/* Subtle Dynamic Background Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.04),rgba(255,255,255,0))]" />
          
          <div className="min-h-screen relative">
            {/* Top Bar */}
            <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-xl md:px-10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Portfolio</span>
                <span className="text-muted-foreground/30">/</span>
                <span className="font-mono text-xs uppercase tracking-widest text-foreground font-semibold">{project.title}</span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Project cycling controls (fixed in header) */}
                {onNavigate && prevProject && nextProject && (
                  <div className="flex items-center gap-1.5 border-r border-border pr-4 mr-1">
                    <button
                      onClick={() => onNavigate(prevProject)}
                      className="group flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-foreground/[0.03] active:scale-95 transition-all cursor-pointer"
                      title={`Previous: ${prevProject.title}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onNavigate(nextProject)}
                      className="group flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-foreground/[0.03] active:scale-95 transition-all cursor-pointer"
                      title={`Next: ${nextProject.title}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-all hover:border-foreground/30 hover:bg-foreground/[0.03] active:scale-95 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-10 md:pt-36 relative z-10">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                
                {/* Left Column: All scrolling details, including image */}
                <div className="space-y-12 lg:col-span-8">
                  {/* Header Title Block */}
                  <div>
                    <span className="inline-block rounded-full border border-indigo-600/10 dark:border-indigo-400/15 bg-indigo-600/[0.04] dark:bg-indigo-400/[0.04] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {project.category}
                    </span>
                    <h1 className="mt-4 text-4xl font-medium tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.15]">
                      {project.title}
                    </h1>
                    <p className="mt-2 text-base text-muted-foreground md:text-lg">
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Screenshot Window Mock */}
                  <div className="overflow-hidden rounded-2xl border border-border bg-[#0c0c0e] shadow-xl">
                    <div className="flex items-center justify-between border-b border-border/40 bg-zinc-950/40 px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
                        <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
                        <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
                      </div>
                      <div className="font-mono text-[9px] text-muted-foreground/60 truncate max-w-xs md:max-w-md">
                        {project.live ? project.live.replace(/^https?:\/\//, "") : `${project.id}.app`}
                      </div>
                      <div className="w-10" />
                    </div>
                     <div className="relative aspect-[16/9] w-full overflow-hidden bg-card">
                       <motion.div
                         layoutId={`project-image-${project.id}`}
                         className="absolute inset-0"
                       >
                         <Image
                           src={project.image}
                           alt={project.imageAlt || project.title}
                           fill
                           priority
                           className="object-cover object-top"
                           sizes="(max-width: 1024px) 100vw, 60vw"
                         />
                       </motion.div>
                     </div>
                  </div>

                  {/* Project Overview */}
                  <div className="space-y-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                      // Project Overview
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground/95">
                      {project.fullDesc}
                    </p>
                  </div>

                  {/* System Architecture */}
                  {project.architecture && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <h3 className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                          // System Architecture
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground/80">
                          {project.architecture.description}
                        </p>
                      </div>
                      {project.architecture.tree && (
                        <div className="relative overflow-hidden rounded-xl border border-indigo-600/10 dark:border-indigo-400/15 bg-neutral-100 dark:bg-zinc-950 p-5">
                          <div className="absolute top-3 right-4 flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground/45">
                            <Folder className="h-3 w-3" /> DIRECTORY MAP
                          </div>
                          <pre className="overflow-x-auto font-mono text-[11px] leading-normal text-emerald-500/90 whitespace-pre">
                            {project.architecture.tree}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Contributions */}
                  <div className="space-y-5">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                      // Key Contributions
                    </h3>
                    <ul className="space-y-3.5">
                      {project.contributions.map((c, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-1.5 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 select-none">
                            0{i + 1}.
                          </span>
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {c}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features */}
                  <div className="space-y-5">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                      // Key Modules & Features
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {project.features.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 text-xs text-muted-foreground hover:border-neutral-300 dark:hover:border-zinc-600 transition-colors"
                        >
                          <span className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0 font-mono select-none">//</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Navigation Link */}
                  {onNavigate && nextProject && (
                    <div className="border-t border-border pt-12 mt-16">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Explore Next Project
                      </span>
                      <button
                        onClick={() => onNavigate(nextProject)}
                        className="group mt-4 flex items-start justify-between w-full text-left cursor-pointer"
                      >
                        <div>
                          <h4 className="text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-muted-foreground/80 md:text-3xl">
                            {nextProject.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {nextProject.subtitle}
                          </p>
                        </div>
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-600 dark:group-hover:border-indigo-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white">
                          <ArrowUpRight className="h-5 w-5" />
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Sticky Basic Info Card */}
                <div className="lg:col-span-4">
                  <div className="sticky top-28 space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl shadow-xl space-y-6">
                      <h2 className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold border-b border-border/40 pb-3">
                        // Quick Information
                      </h2>

                      {/* Details table list */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-muted-foreground/60 uppercase">Role</span>
                          <span className="font-medium text-foreground">{project.role || "Developer"}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-muted-foreground/60 uppercase">Company</span>
                          <span className="font-medium text-foreground">{project.company || "Personal"}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-muted-foreground/60 uppercase">Timeline</span>
                          <span className="font-medium text-foreground">{project.timeline || "Ongoing"}</span>
                        </div>
                      </div>

                      {/* Tech Stack section inside the card */}
                      <div className="space-y-3 pt-2">
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                          Technologies Used
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {project.tech.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-neutral-200 dark:border-zinc-700 bg-neutral-100 dark:bg-zinc-950 px-2.5 py-0.75 text-[9px] font-mono text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-600/40 dark:hover:border-indigo-400/40 transition-all duration-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Visit website button inside the card */}
                      {project.live && (
                        <div className="pt-2">
                          <a
                            href={project.live}
                            target="_blank"
                            rel="noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-5 py-3 text-xs font-mono uppercase tracking-wider text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] active:scale-95"
                          >
                            <span>Visit Live App</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
