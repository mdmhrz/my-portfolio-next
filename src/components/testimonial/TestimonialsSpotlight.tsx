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

  const arrows = (
    <>
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
    </>
  );

  // Desktop-only glass quote bubble that overlaps the card.
  const bubble = (
    <div className="relative w-full">
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
    <section id="testimonials" className="relative border-t border-border bg-background px-6 py-20 md:py-36">
      <div className="container relative mx-auto max-w-7xl lg:overflow-hidden">
        {/* Decorative dot grid + accent comma — desktop only (they'd crowd the title on mobile) */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 hidden h-52 w-96 text-muted-foreground opacity-20 lg:block"
          style={{ backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }}
        />
        <Quote
          aria-hidden
          strokeWidth={0}
          className="pointer-events-none absolute right-4 top-0 hidden h-40 w-40 fill-primary lg:block"
        />

        <SectionReveal preview={preview} className="mb-10 flex flex-col gap-3 lg:mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Testimonials</span>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">{title}</h2>
          {subtitle && <p className="max-w-xl text-base text-muted-foreground">{subtitle}</p>}
        </SectionReveal>

        {/* ---------------- MOBILE / TABLET (< lg): words first, small avatar ---------------- */}
        <SectionReveal preview={preview} className="flex flex-col gap-8 lg:hidden">
          {/* Quote — the prominent element */}
          <blockquote
            key={current.id}
            className="relative rounded-2xl rounded-bl-none border border-border/60 bg-card/50 p-6 shadow-lg backdrop-blur-md duration-500 animate-in fade-in slide-in-from-bottom-4"
          >
            <div aria-hidden className="absolute -bottom-2 -right-2 h-14 w-14 rounded-br-2xl border-b-2 border-r-2 border-primary/40" />
            <Quote aria-hidden strokeWidth={0} className="mb-3 h-7 w-7 fill-primary/50" />
            <p className="text-base leading-relaxed text-foreground">&ldquo;{current.quote}&rdquo;</p>
          </blockquote>

          {/* Small avatar + name + arrows */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
              <Avatar t={current} className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground">{current.name}</p>
              {(current.role || current.company) && (
                <p className="truncate text-sm text-muted-foreground">{[current.role, current.company].filter(Boolean).join(", ")}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">{arrows}</div>
          </div>

          {/* Small thumbnail scroller — active one highlighted */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${t.name}`}
                className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  i === active ? "border-primary" : "border-border grayscale hover:grayscale-0"
                }`}
              >
                <Avatar t={t} className="object-cover" />
              </button>
            ))}
          </div>
        </SectionReveal>

        {/* ---------------- DESKTOP (lg+): featured card with overlapping bubble ---------------- */}
        <div className="hidden gap-x-10 lg:grid lg:grid-cols-[minmax(0,320px)_1fr]">
          {/* LEFT: arrows on top of the image, then the featured card */}
          <SectionReveal preview={preview} className="flex flex-col">
            <div className="mb-5 flex gap-2">{arrows}</div>

            <div className="relative rounded-3xl border border-primary/25 bg-primary/10 p-3">
              <div className="absolute -top-16 left-[72%] z-20 w-96">{bubble}</div>
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

          {/* RIGHT: counter + thumbnails, aligned to the bottom-right */}
          <SectionReveal preview={preview} className="flex flex-col justify-end">
            <div className="flex flex-col items-end">
              <div className="mb-4 inline-flex items-center rounded-full border border-primary/40 px-4 py-1 text-sm font-medium text-primary">
                {active + 1} / {count}
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                {testimonials.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show ${t.name}`}
                    className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all sm:h-24 sm:w-24 lg:h-28 lg:w-28 ${
                      i === active
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border grayscale hover:grayscale-0 hover:ring-2 hover:ring-primary/60"
                    }`}
                  >
                    <Avatar t={t} className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
