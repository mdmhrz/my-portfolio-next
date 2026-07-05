'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { SectionReveal } from "./SectionReveal";
import type { TestimonialItem, TestimonialsSectionProps } from "./types";

const DEFAULT_TITLE = "Customer Reviews";
const DEFAULT_SUBTITLE = "What people say after we ship together.";

const toRad = (deg: number) => (deg * Math.PI) / 180;

// Avatar circle: one dot per visible testimonial, positioned as an angular offset
// from the active one so the active avatar always sits on the arc's apex.
function getArcItems(
  testimonials: TestimonialItem[],
  active: number,
  count: number,
) {
  const windowSize = Math.min(5, count);
  const half = Math.floor(windowSize / 2);
  return { half, items: Array.from({ length: windowSize }, (_, k) => {
    const idx = (active - half + k + count) % count;
    return { item: testimonials[idx], idx, offset: k - half };
  }) };
}

function ArcAvatar({
  item, isActive, size, x, y, onClick,
}: {
  item: TestimonialItem; isActive: boolean; size: number; x: number | string; y: number | string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ left: x, top: y, width: size, height: size }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
        isActive ? "z-10 ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"
      }`}
      aria-label={`Show ${item.name}'s review`}
    >
      <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
        {item.avatarUrl ? (
          <Image src={item.avatarUrl} alt={item.avatarAlt || item.name} width={typeof size === "number" ? size : 96} height={typeof size === "number" ? size : 96} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">{item.name.charAt(0)}</span>
        )}
      </span>
    </button>
  );
}

function QuoteBlock({ t, center = false }: { t: TestimonialItem; center?: boolean }) {
  return (
    <div className={center ? "flex flex-col items-center text-center" : "relative"}>
      <span className="font-serif text-7xl leading-none text-primary/30 md:text-8xl">“</span>
      <blockquote
        key={t.id}
        className="-mt-6 font-serif text-xl italic leading-relaxed text-foreground/90 duration-700 animate-in fade-in md:text-3xl md:leading-relaxed"
      >
        {t.quote}
      </blockquote>
      <footer className="mt-6 md:mt-8">
        <p className="text-base font-semibold text-foreground">{t.name}</p>
        <span className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          {t.rating ? (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {t.rating.toFixed(1)}
            </span>
          ) : null}
          {(t.role || t.company) && (
            <span>{[t.role, t.company].filter(Boolean).join(", ")}</span>
          )}
        </span>
      </footer>
    </div>
  );
}

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

  const { half, items } = getArcItems(testimonials, active, count);

  // --- Desktop: vertical right-slice of a circle, anchored to the left edge ---
  const V = { r: 192, cx: -54, cy: 200, spread: 62, width: 300, height: 400 };
  const vStep = V.spread / Math.max(half, 1);
  const vEndX = V.cx + V.r * Math.cos(toRad(V.spread));
  const vPath = `M ${vEndX.toFixed(1)} ${(V.cy - V.r * Math.sin(toRad(V.spread))).toFixed(1)} A ${V.r} ${V.r} 0 0 1 ${vEndX.toFixed(1)} ${(V.cy + V.r * Math.sin(toRad(V.spread))).toFixed(1)}`;

  // --- Mobile: top-half of a circle, avatars fan out below the apex ---
  const M = { r: 150, cx: 200, apexY: 40, spread: 68, vbW: 400, vbH: 190 };
  const mCy = M.apexY + M.r;
  const mStep = M.spread / Math.max(half, 1);
  const mEndX = M.cx + M.r * Math.sin(toRad(M.spread));
  const mEndY = mCy - M.r * Math.cos(toRad(M.spread));
  const mPath = `M ${(M.cx - M.r * Math.sin(toRad(M.spread))).toFixed(1)} ${mEndY.toFixed(1)} A ${M.r} ${M.r} 0 0 1 ${mEndX.toFixed(1)} ${mEndY.toFixed(1)}`;

  return (
    <section id="testimonials" className="relative border-t border-border bg-background px-6 py-24 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <SectionReveal preview={preview} className="mb-12 flex flex-col gap-3 md:mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-0.5 w-8 bg-primary" />
            Testimonials
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h2>
          <p className="max-w-xl text-base text-muted-foreground">{subtitle}</p>
        </SectionReveal>

        {/* MOBILE: quote on top, horizontal top-half arc below */}
        <SectionReveal preview={preview} className="flex flex-col items-center gap-10 md:hidden">
          <QuoteBlock t={current} center />
          <div
            className="relative w-full max-w-sm"
            style={{ aspectRatio: `${M.vbW} / ${M.vbH}` }}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${M.vbW} ${M.vbH}`} fill="none" aria-hidden preserveAspectRatio="xMidYMid meet">
              <path d={mPath} stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" className="text-border" />
            </svg>
            {items.map(({ item, idx, offset }) => {
              const angle = offset * mStep;
              const x = M.cx + M.r * Math.sin(toRad(angle));
              const y = mCy - M.r * Math.cos(toRad(angle));
              const isActive = idx === active;
              return (
                <ArcAvatar
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  size={isActive ? 64 : 44}
                  x={`${(x / M.vbW) * 100}%`}
                  y={`${(y / M.vbH) * 100}%`}
                  onClick={() => setActive(idx)}
                />
              );
            })}
          </div>
        </SectionReveal>

        {/* DESKTOP: vertical arc on the left, quote on the right */}
        <div className="hidden items-center gap-14 md:grid md:grid-cols-2">
          <SectionReveal preview={preview}>
            <div
              className="relative w-full"
              style={{ height: V.height }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <svg className="pointer-events-none absolute left-0 top-0" width={V.width} height={V.height} viewBox={`0 0 ${V.width} ${V.height}`} fill="none" aria-hidden>
                <path d={vPath} stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" className="text-border" />
              </svg>
              {items.map(({ item, idx, offset }) => {
                const angle = offset * vStep;
                const x = V.cx + V.r * Math.cos(toRad(angle));
                const y = V.cy + V.r * Math.sin(toRad(angle));
                const isActive = idx === active;
                const size = isActive ? 84 : 52;
                return (
                  <div key={item.id} className="contents">
                    <ArcAvatar item={item} isActive={isActive} size={size} x={x} y={y} onClick={() => setActive(idx)} />
                    {isActive && (
                      <span
                        className="pointer-events-none absolute z-10 -translate-y-1/2 whitespace-nowrap"
                        style={{ left: x + size / 2 + 12, top: y }}
                      >
                        <span className="block text-sm font-semibold text-foreground">{item.name}</span>
                        {item.role && <span className="mt-0.5 block text-xs text-muted-foreground">{item.role}</span>}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionReveal>

          <SectionReveal preview={preview}>
            <QuoteBlock t={current} />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
