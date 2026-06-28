'use client';

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/global/Reveal";
import { motion } from "motion/react";

import { Magnetic } from "@/components/global/Magnetic";

export function CTA({ settings, about }: { settings?: any; about?: any }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const headline = settings?.ctaHeadline || "Let's build something solid.";
  const subtext = settings?.ctaSubtext || "Frontend & full-stack engineering — from Next.js interfaces to Node & Go services. Open to freelance work, consulting, and full-time roles.";
  const availability = about?.availability || "Available for projects & roles";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <section className="relative overflow-hidden bg-background px-6 py-24 md:py-32">
      {/* Decorative Background Blur Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <Reveal y={40}>
          <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-20 text-center md:px-12 md:py-28 transition-all duration-500 shadow-2xl backdrop-blur-xl"
          >
            {/* Interactive Spotlight Follow Glow */}
            <div
              className="pointer-events-none absolute -inset-px transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`,
              }}
            />

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
              {/* Pulsing Availability Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-500 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {availability}
              </div>

              {/* Header Title with premium gradient */}
              <h2 className="mt-7 text-4xl font-medium leading-[0.95] tracking-tight text-foreground md:text-6xl max-w-2xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                {headline}
              </h2>

              {/* Subtext description */}
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {subtext}
              </p>

              {/* Next-level Interactive Button */}
              <Magnetic>
                <a
                  href="#contact"
                  className="group relative mt-10 inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-8 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get in touch
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </a>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
