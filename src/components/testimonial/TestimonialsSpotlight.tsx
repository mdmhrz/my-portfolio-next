'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { SectionReveal } from "./SectionReveal";
import type { TestimonialItem, TestimonialsSectionProps } from "./types";

const DEFAULT_TITLE = "What they say about me";

function Avatar({ t, className }: { t: TestimonialItem; className?: string }) {
  if (t.avatarUrl) {
    return <Image src={t.avatarUrl} alt={t.avatarAlt || t.name} fill sizes="400px" className={className} />;
  }
  return (
    <span className={`flex h-full w-full items-center justify-center bg-muted text-2xl font-semibold text-muted-foreground ${className ?? ""}`}>
      {t.name.charAt(0)}
    </span>
  );
}

export function TestimonialsSpotlight({
  testimonials,
  settings,
  preview = false,
}: TestimonialsSectionProps) {
  const [active, setActive] = useState(0);
  const count = testimonials.length;

  useEffect(() => {
    if (preview || count <= 1) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % count), 3000);
    return () => clearInterval(timer);
  }, [preview, count]);

  if (count === 0) return null;

  const title = settings?.homepageTestimonialsTitle?.trim() || DEFAULT_TITLE;
  const subtitle = settings?.homepageTestimonialsSubtitle?.trim();
  const current = testimonials[Math.min(active, count - 1)];
  const go = (i: number) => setActive(((i % count) + count) % count);

  const bubble = (
    <div className="relative w-full">
      {/* the only extra border: a stacked-card corner peeking out at the bottom-right */}
      <div aria-hidden className="absolute -bottom-2.5 -right-2.5 h-20 w-20 rounded-br-2xl border-b-2 border-r-2 border-primary/40" />
      <div
        key={current.id}
        className="relative rounded-2xl rounded-bl-none border border-border/60 bg-card/50 p-6 shadow-lg backdrop-blur-md duration-500 ease-out animate-in fade-in slide-in-from-bottom-4 zoom-in-95"
      >
        <p className="text-sm leading-relaxed text-foreground md:text-base">
          &ldquo;{current.quote}&rdquo;
        </p>
      </div>
    </div>
  );

  return (
    <section
      id="testimonials"
      className="relative border-t border-border bg-background px-6 py-24 md:py-36"
    >
      <div className="container relative mx-auto max-w-7xl overflow-hidden">
        {/* Decorative dot grid (rendered first → sits BEHIND) + big accent comma (on top) */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-52 w-96 text-muted-foreground opacity-20"
          style={{ backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }}
        />
        <Quote
          aria-hidden
          strokeWidth={0}
          className="pointer-events-none absolute right-4 top-0 h-28 w-28 fill-primary md:h-40 md:w-40"
        />

        <SectionReveal preview={preview} className="mb-12 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Testimonials</span>
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h2>
          {subtitle && <p className="max-w-xl text-base text-muted-foreground">{subtitle}</p>}
        </SectionReveal>

        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-x-10">
          {/* LEFT: arrows sit on top of the image, then the featured card */}
          <SectionReveal preview={preview} className="flex flex-col">
            <div className="mb-5 flex gap-2">
              <button
                type="button"
                onClick={() => go(active - 1)}
                aria-label="Previous"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary/50 transition-colors hover:bg-primary/20 hover:text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label="Next"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="relative rounded-3xl border border-primary/25 bg-primary/10 p-3">
              {/* Desktop: bubble overlaps the card's top-right corner (tweak -top / left) */}
              <div className="absolute -top-16 left-[72%] z-20 hidden w-96 md:block">
                {bubble}
              </div>
              <div key={current.id} className="overflow-hidden rounded-2xl border border-border/60 duration-500 animate-in fade-in zoom-in-95">
                <div className="relative aspect-[4/5] w-full">
                  <Avatar t={current} className="object-cover" />
                </div>
              </div>
              <div key={`meta-${current.id}`} className="py-4 text-center duration-500 animate-in fade-in">
                <p className="text-lg font-bold text-foreground">{current.name}</p>
                {(current.role || current.company) && (
                  <p className="text-sm text-muted-foreground">{[current.role, current.company].filter(Boolean).join(", ")}</p>
                )}
              </div>
            </div>
          </SectionReveal>

          {/* RIGHT: thumbnails at the bottom (on desktop the bubble overlaps the card) */}
          <SectionReveal preview={preview} className="flex flex-col justify-end gap-10">
            {/* Mobile-only bubble; desktop shows the one overlapping the card */}
            <div className="max-w-lg md:hidden">{bubble}</div>

            <div className="flex flex-col items-end">
              <div className="mb-4 inline-flex items-center rounded-full border border-primary/40 px-4 py-1 text-sm font-medium text-primary">
                {active + 1} / {count}
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                {testimonials.map((t, i) =>
                  i === active ? null : (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Show ${t.name}`}
                      className="relative h-20 w-20 overflow-hidden rounded-xl border border-border grayscale transition-all hover:grayscale-0 hover:ring-2 hover:ring-primary/60 sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                    >
                      <Avatar t={t} className="object-cover" />
                    </button>
                  ),
                )}
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
