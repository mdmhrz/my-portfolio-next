'use client';

import { Reveal } from "@/components/Reveal";

const groups = [
  {
    label: "Languages",
    items: ["JavaScript (ES6+)", "TypeScript", "Go"],
  },
  {
    label: "Frontend",
    items: ["React", "Next.js", "Zustand", "React Query", "Tailwind CSS", "ShadCN UI", "Bootstrap"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Express.js", "Go", "Echo"],
  },
  {
    label: "Database & ORM",
    items: ["PostgreSQL", "MongoDB", "Prisma", "GORM"],
  },
  {
    label: "Auth & Security",
    items: ["JWT", "NextAuth", "BetterAuth", "Firebase Auth"],
  },
  {
    label: "Payments",
    items: ["Stripe", "SSLCommerz"],
  },
  {
    label: "Cloud & DevOps",
    items: ["AWS EC2", "Docker", "Vercel", "Netlify", "Railway", "Render"],
  },
  {
    label: "Tools",
    items: ["Git", "GitHub", "Figma"],
  },
];

export function AIWorkflow() {
  return (
    <section id="skills" className="relative border-y border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-6xl">
        <Reveal className="mb-14 flex flex-col gap-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Stack
          </span>
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-6xl">
            Tools I build with.
          </h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            Frontend-first full-stack — from React interfaces to Node &amp; Go services, Postgres,
            and Docker-on-AWS deployments.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <Reveal key={g.label} y={28} delay={(i % 3) * 0.06}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-500 hover:border-foreground/20">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground">
                    {g.label}
                  </h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <span
                      key={it}
                      className="rounded-full border border-border bg-foreground/[0.02] px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
