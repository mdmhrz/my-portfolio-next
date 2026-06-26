'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  MapPin,
  Lightning,
  X,
  ArrowUpRight,
  CheckCircle,
} from "@phosphor-icons/react";
import { Reveal } from "@/components/Reveal";

type Project = {
  id: string;
  title: string;
  category: string;
  desc: string;
  fullDesc: string;
  tech: string[];
  features: string[];
  contributions: string[];
  live: string;
  image: string;
};

const projects: Project[] = [
  {
    id: "taskip",
    title: "Taskip",
    category: "SaaS · CRM",
    desc: "All-in-one SaaS client portal & project management platform.",
    fullDesc:
      "Taskip is a multi-tenant SaaS platform for agencies — combining CRM, project management, ticketing, and client collaboration into a single workspace. I built core modules end to end and led a major frontend architecture migration.",
    tech: ["Next.js", "TypeScript", "Zustand", "ShadCN UI", "Tailwind"],
    features: [
      "Auth, onboarding & dashboard",
      "Ticketing & CRM",
      "Sales pipeline & lead management",
      "Booking & multilingual support",
    ],
    contributions: [
      "Built auth, onboarding, dashboard, ticketing, CRM, sales pipeline, lead, booking and multilingual modules.",
      "Led migration from subdomain-based to path-based multi-tenancy for scalability.",
      "Built reusable component systems & scalable CRM workflows.",
      "Integrated backend APIs across multiple business domains.",
    ],
    live: "https://taskip.app",
    image: "/projects/taskip.png",
  },
  {
    id: "reportgenix",
    title: "ReportGenix",
    category: "Shopify App",
    desc: "Custom reporting & automated report builder for Shopify merchants.",
    fullDesc:
      "ReportGenix is a Shopify app for custom reporting and report automation. I developed the reporting interfaces and the dynamic report builder used by merchants to generate analytics without spreadsheets.",
    tech: ["React (Vite)", "TypeScript", "Tailwind CSS"],
    features: [
      "Custom reporting modules",
      "Automated report builder",
      "Dynamic data integrations",
      "Merchant-facing dashboards",
    ],
    contributions: [
      "Developed custom reporting & automated report builder modules.",
      "Built dynamic reporting interfaces and data integrations.",
      "Improved UX and interface consistency across the app.",
    ],
    live: "https://reportgenix.com",
    image: "/projects/reportgenix.png",
  },
  {
    id: "xilancer",
    title: "Xilancer",
    category: "Marketplace",
    desc: "Freelance marketplace solution for commercial distribution.",
    fullDesc:
      "Xilancer is a commercial freelance marketplace solution. I contributed to the frontend, building reusable UI components and application workflows that improved user experience and interface consistency.",
    tech: ["JavaScript", "Bootstrap", "Laravel"],
    features: [
      "Service listings & gigs",
      "Order & milestone flows",
      "Reusable component library",
      "Admin tooling",
    ],
    contributions: [
      "Contributed to frontend development & feature implementation.",
      "Built reusable UI components and application workflows.",
      "Improved user experience and interface consistency.",
    ],
    live: "https://xilancer.xgenious.com",
    image: "/projects/xilancer.png",
  },
];

export function Experience() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = projects.find((p) => p.id === openId) || null;

  useEffect(() => {
    document.body.style.overflow = openId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openId]);

  return (
    <section id="experience" className="relative overflow-hidden border-y border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <Reveal className="mb-16 flex flex-col gap-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
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
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-foreground/[0.03] text-foreground">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium tracking-tight text-foreground">Xgenious</h3>
                    <div className="mt-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      <Lightning className="h-3.5 w-3.5" /> Frontend Developer
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
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
          {projects.map((p, idx) => (
            <Reveal key={p.id} y={40} delay={idx * 0.08}>
              <button
                onClick={() => setOpenId(p.id)}
                className="group relative block h-[380px] w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-colors duration-500 hover:border-foreground/20"
              >
                <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {p.category}
                  </span>
                  <h4 className="mt-1 text-2xl font-medium tracking-tight text-foreground">{p.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {p.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    View case <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Project detail stage */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] overflow-y-auto overscroll-contain bg-background"
                data-lenis-prevent="true"
              >
                <div className="min-h-screen">
                  {/* Top bar */}
                  <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-xl md:px-10">
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                      MHR.DEV <span className="text-muted-foreground">/ {open.title}</span>
                    </span>
                    <button
                      onClick={() => setOpenId(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground/5"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Hero */}
                  <div className="px-6 pb-12 pt-32 md:px-10 md:pt-40">
                    <div className="mx-auto max-w-7xl">
                      <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                        {open.category}
                      </span>
                      <h2 className="mt-3 text-5xl font-medium tracking-tight text-foreground md:text-7xl">
                        {open.title}
                      </h2>
                      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-2xl">
                        {open.fullDesc}
                      </p>

                      <div className="mt-8 flex flex-wrap gap-2">
                        {open.tech.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
                        <div className="relative aspect-[16/10] w-full">
                          <Image src={open.image} alt={open.title} fill className="object-cover object-top" />
                        </div>
                      </div>

                      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
                        <div>
                          <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                            My contributions
                          </h4>
                          <div className="mt-5 space-y-3">
                            {open.contributions.map((c) => (
                              <div key={c} className="flex gap-3">
                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                                <span className="text-sm leading-relaxed text-muted-foreground">{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                            Modules / features
                          </h4>
                          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {open.features.map((f) => (
                              <div
                                key={f}
                                className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                              >
                                {f}
                              </div>
                            ))}
                          </div>
                          <a
                            href={open.live}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
                          >
                            View live <ArrowUpRight className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
