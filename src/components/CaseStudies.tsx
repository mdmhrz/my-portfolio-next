'use client';

import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/Reveal";

const featured = [
  {
    title: "NexDrop",
    subtitle: "Parcel Delivery Management Platform",
    desc: "Full-stack parcel delivery platform with dedicated dashboards for customers, riders, admins & super-admins. Real-time tracking, rider earnings, and Stripe + SSLCommerz payments.",
    tags: ["Full-stack", "Real-time", "Payments"],
    tech: ["Next.js", "TypeScript", "Node.js", "Express.js", "PostgreSQL", "Prisma", "Docker", "AWS EC2"],
    live: "https://nexdrop.mhrazu.com",
    image: null,
    span: "lg:col-span-7",
  },
  {
    title: "Taskip",
    subtitle: "SaaS Client Portal & CRM",
    desc: "Multi-tenant SaaS for agencies — CRM, project management, ticketing and client collaboration in one workspace.",
    tags: ["SaaS", "CRM", "Multi-tenant"],
    tech: ["Next.js", "TypeScript", "Zustand", "ShadCN UI"],
    live: "https://taskip.app",
    image: "/projects/taskip.png",
    span: "lg:col-span-5",
  },
];

export function CaseStudies() {
  return (
    <section id="work" className="container mx-auto max-w-6xl px-6 py-28 md:py-40">
      <Reveal className="mb-14 flex flex-col gap-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Selected work
        </span>
        <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-6xl">
          Things I&apos;ve shipped.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {featured.map((p, i) => (
          <Reveal key={p.title} y={40} delay={i * 0.08} className={p.span}>
            <a
              href={p.live}
              target="_blank"
              rel="noreferrer"
              className="group relative block h-[460px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors duration-500 hover:border-foreground/20 md:h-[520px]"
            >
              {/* Visual */}
              <div className="absolute inset-0">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  // NexDrop has no screenshot — a monochrome route/tracking motif.
                  <div className="relative h-full w-full bg-card">
                    <svg
                      className="absolute inset-0 h-full w-full text-foreground/[0.07]"
                      viewBox="0 0 400 400"
                      fill="none"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      <path
                        d="M40 320 C 120 280, 120 120, 220 140 S 360 200, 360 80"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="6 8"
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle cx="40" cy="320" r="8" fill="currentColor" />
                      <circle cx="360" cy="80" r="8" fill="currentColor" />
                      <circle cx="220" cy="140" r="5" fill="currentColor" />
                    </svg>
                    <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_30%_30%,transparent,background)]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              </div>

              {/* Top-right external marker */}
              <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-foreground opacity-0 backdrop-blur transition-all duration-500 group-hover:opacity-100 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                <div className="mb-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-background/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground backdrop-blur"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground/70">{p.subtitle}</p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span key={t} className="text-[11px] text-muted-foreground/80">
                      {t}
                      <span className="mx-1.5 text-muted-foreground/30">·</span>
                    </span>
                  ))}
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
