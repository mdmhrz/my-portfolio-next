'use client';

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-20 md:py-28">
      <div className="container mx-auto max-w-7xl">
        <Reveal y={40}>
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-20 text-center md:px-12 md:py-28">
            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-background/60">
                Available for new projects &amp; roles
              </span>
              <h2 className="mt-5 text-4xl font-medium leading-[0.95] tracking-tight text-background md:text-6xl">
                Let&apos;s build something solid.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-background/70 md:text-lg">
                Frontend &amp; full-stack engineering — from Next.js interfaces to Node &amp; Go
                services. Open to freelance work and full-time roles.
              </p>
              <a
                href="#contact"
                className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-background px-7 text-sm font-medium text-foreground transition-transform hover:scale-[1.03]"
              >
                Get in touch
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
