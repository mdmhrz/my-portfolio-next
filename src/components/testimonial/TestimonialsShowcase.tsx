'use client';

import Image from "next/image";
import { Star, ArrowUpRight } from "lucide-react";
import { SectionReveal } from "./SectionReveal";
import type { TestimonialItem, TestimonialsSectionProps } from "./types";

const DEFAULT_TITLE = "Hear from the clients I've helped ship.";
const DEFAULT_STAT = "50+";
const DEFAULT_STAT_LABEL = "Projects delivered";
const DEFAULT_CTA = "Start a project";
const DEFAULT_CTA_LINK = "/contact";

function Stars({ rating, className = "" }: { rating?: number | null; className?: string }) {
  const n = rating ?? 5;
  return (
    <span className={`flex gap-0.5 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < n ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

function Bubble({ t, featured = false }: { t: TestimonialItem; featured?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        featured ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
      }`}
    >
      <Stars rating={t.rating} />
      <p className={`mt-4 text-sm leading-relaxed ${featured ? "text-primary-foreground/90" : "text-foreground"}`}>
        “{t.quote}”
      </p>
      <div className="mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/40 bg-muted">
          {t.avatarUrl ? (
            <Image src={t.avatarUrl} alt={t.avatarAlt || t.name} width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">{t.name.charAt(0)}</span>
          )}
        </span>
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${featured ? "text-primary-foreground" : "text-foreground"}`}>{t.name}</p>
          {(t.role || t.company) && (
            <p className={`truncate text-xs ${featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {[t.role, t.company].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TestimonialsShowcase({
  testimonials,
  settings,
  preview = false,
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  const title = settings?.homepageTestimonialsTitle?.trim() || DEFAULT_TITLE;
  const stat = settings?.homepageTestimonialsStat?.trim() || DEFAULT_STAT;
  const statLabel = settings?.homepageTestimonialsStatLabel?.trim() || DEFAULT_STAT_LABEL;
  const cta = settings?.homepageTestimonialsCtaText?.trim() || DEFAULT_CTA;
  const ctaLink = settings?.homepageTestimonialsCtaLink?.trim() || DEFAULT_CTA_LINK;

  const collage = testimonials.filter((t) => t.avatarUrl).slice(0, 4);
  const bubbles = testimonials.slice(0, 3);

  return (
    <section id="testimonials" className="relative border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: image/collage tile with stat */}
          <SectionReveal preview={preview} className="relative min-h-[26rem] overflow-hidden rounded-3xl border border-border">
            {collage.length > 0 ? (
              <div className={`absolute inset-0 grid ${collage.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {collage.map((t) => (
                  <div key={t.id} className="relative">
                    <Image src={t.avatarUrl as string} alt={t.avatarAlt || t.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 bg-muted" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            <span className="absolute left-6 top-6 max-w-[16rem] rounded-2xl bg-background px-5 py-3 text-lg font-semibold leading-snug text-foreground shadow-lg">
              {title}
            </span>
            <div className="absolute bottom-6 left-6">
              <p className="text-5xl font-bold text-white md:text-6xl">{stat}</p>
              <p className="mt-1 text-sm text-white/80">{statLabel}</p>
            </div>
          </SectionReveal>

          {/* Right: stacked chat-bubble reviews */}
          <SectionReveal preview={preview} className="flex flex-col gap-4">
            {bubbles.map((t, i) => (
              <Bubble key={t.id} t={t} featured={i === 0} />
            ))}
          </SectionReveal>
        </div>

        {/* Bottom CTA banner */}
        <SectionReveal preview={preview} className="mt-4 flex flex-col items-center justify-between gap-4 rounded-3xl bg-primary px-8 py-8 text-primary-foreground sm:flex-row">
          <p className="text-2xl font-semibold md:text-3xl">Are you the next success story?</p>
          <a
            href={ctaLink}
            className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-105"
          >
            {cta}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </SectionReveal>
      </div>
    </section>
  );
}
