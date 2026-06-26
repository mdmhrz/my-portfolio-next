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
    image: "/nex-drop.png",
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
              className="group relative flex h-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 hover:border-foreground/25 hover:shadow-md md:h-[560px]"
            >
              {/* App window frame */}
              <div className="relative shrink-0 overflow-hidden border-b border-border bg-muted/30">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="ml-2 truncate text-[10px] font-medium tracking-tight text-muted-foreground/70">
                    {p.live.replace(/^https?:\/\//, "")}
                  </span>
                </div>
                {/* Screenshot */}
                <div className="relative h-[200px] w-full overflow-hidden md:h-[240px]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />
                </div>
              </div>

              {/* Content panel */}
              <div className="flex flex-1 flex-col p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                      {p.title}
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-foreground/60">{p.subtitle}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-foreground/40 group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>

                {/* Tech stack */}
                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border pt-4">
                    {p.tech.map((t, idx) => (
                      <span key={t} className="flex items-center gap-2">
                        <span className="text-[11px] font-medium tracking-tight text-muted-foreground/80">
                          {t}
                        </span>
                        {idx < p.tech.length - 1 && (
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/25" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
