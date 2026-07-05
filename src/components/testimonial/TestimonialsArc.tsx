'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { SectionReveal } from "./SectionReveal";
import type { TestimonialsSectionProps } from "./types";

const DEFAULT_TITLE = "Customer Reviews";
const DEFAULT_SUBTITLE = "What people say after we ship together.";

export function TestimonialsArc({
  testimonials,
  settings,
  preview = false,
}: TestimonialsSectionProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = testimonials.length;

  useEffect(() => {
    if (preview || paused || count <= 1) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % count), 4000);
    return () => clearInterval(timer);
  }, [preview, paused, count]);

  if (count === 0) return null;

  const title = settings?.homepageTestimonialsTitle?.trim() || DEFAULT_TITLE;
  const subtitle = settings?.homepageTestimonialsSubtitle?.trim() || DEFAULT_SUBTITLE;
  const current = testimonials[Math.min(active, count - 1)];

  // A single circle drives BOTH the dashed line and the avatar positions, in pixel
  // space (isotropic → a true circle, never an ellipse). Only the right slice of the
  // circle is drawn, so its chord sits flush against the container's left edge and the
  // arc bulges rightward — the active avatar rides the rightmost point.
  const ARC = { r: 192, cx: -54, cy: 200, spread: 62, height: 400, width: 300 };
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const windowSize = Math.min(5, count);
  const half = Math.floor(windowSize / 2);
  const arcItems = Array.from({ length: windowSize }, (_, k) => {
    const idx = (active - half + k + count) % count;
    const angle = windowSize === 1 ? 0 : -ARC.spread + (k / (windowSize - 1)) * 2 * ARC.spread;
    const x = ARC.cx + ARC.r * Math.cos(toRad(angle));
    const y = ARC.cy + ARC.r * Math.sin(toRad(angle));
    return { item: testimonials[idx], idx, x, y };
  });

  // Endpoints of the drawn slice, kept in sync with the same circle.
  const endX = ARC.cx + ARC.r * Math.cos(toRad(ARC.spread));
  const endTopY = ARC.cy - ARC.r * Math.sin(toRad(ARC.spread));
  const endBotY = ARC.cy + ARC.r * Math.sin(toRad(ARC.spread));
  const arcPath = `M ${endX.toFixed(1)} ${endTopY.toFixed(1)} A ${ARC.r} ${ARC.r} 0 0 1 ${endX.toFixed(1)} ${endBotY.toFixed(1)}`;

  return (
    <section id="testimonials" className="relative border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <SectionReveal preview={preview} className="mb-16 flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-0.5 w-8 bg-primary" />
            Testimonials
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h2>
          <p className="max-w-xl text-base text-muted-foreground">{subtitle}</p>
        </SectionReveal>

        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
          {/* Left: avatars riding a real circular arc, anchored to the left edge */}
          <SectionReveal preview={preview}>
            <div
              className="relative w-full"
              style={{ height: ARC.height }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Dashed circular arc — 1:1 px viewBox keeps it a perfect circle */}
              <svg
                className="pointer-events-none absolute left-0 top-0"
                width={ARC.width}
                height={ARC.height}
                viewBox={`0 0 ${ARC.width} ${ARC.height}`}
                fill="none"
                aria-hidden
              >
                <path d={arcPath} stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" className="text-border" />
              </svg>

              {arcItems.map(({ item, idx, x, y }) => {
                const isActive = idx === active;
                const size = isActive ? 84 : 52;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(idx)}
                    style={{ left: x, top: y, width: size, height: size }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
                      isActive ? "z-10 ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Show ${item.name}'s review`}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                      {item.avatarUrl ? (
                        <Image src={item.avatarUrl} alt={item.avatarAlt || item.name} width={size} height={size} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">{item.name.charAt(0)}</span>
                      )}
                    </span>
                    {isActive && (
                      <span className="absolute left-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap text-left md:block">
                        <span className="block text-sm font-semibold text-foreground">{item.name}</span>
                        {item.rating ? (
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            {item.rating.toFixed(1)}
                            {item.role ? ` · ${item.role}` : ""}
                          </span>
                        ) : item.role ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground">{item.role}</span>
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </SectionReveal>

          {/* Right: large italic serif quote */}
          <SectionReveal preview={preview} className="relative">
            <span className="font-serif text-8xl leading-none text-primary/30">“</span>
            <blockquote
              key={current.id}
              className="-mt-6 font-serif text-2xl italic leading-relaxed text-foreground/90 md:text-3xl md:leading-relaxed animate-in fade-in duration-700"
            >
              {current.quote}
            </blockquote>
            <footer className="mt-8">
              <p className="text-base font-semibold text-foreground">{current.name}</p>
              {(current.role || current.company) && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[current.role, current.company].filter(Boolean).join(", ")}
                </p>
              )}
            </footer>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
