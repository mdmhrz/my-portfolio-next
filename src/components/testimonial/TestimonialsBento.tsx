'use client';

import Image from "next/image";
import { Star, Quote, ArrowUpRight } from "lucide-react";
import { SectionReveal } from "./SectionReveal";
import type { TestimonialItem, TestimonialsSectionProps } from "./types";

const DEFAULT_TITLE = "Results that speak volume";
const DEFAULT_SUBTITLE = "A few of the outcomes I've helped teams reach.";
const DEFAULT_CTA = "Read success stories";
const DEFAULT_CTA_LINK = "/contact";

function Author({ t, tone = "default" }: { t: TestimonialItem; tone?: "default" | "invert" }) {
  const nameColor = tone === "invert" ? "text-background" : "text-foreground";
  const roleColor = tone === "invert" ? "text-background/60" : "text-muted-foreground";
  return (
    <div className="mt-5 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted">
        {t.avatarUrl ? (
          <Image src={t.avatarUrl} alt={t.avatarAlt || t.name} width={36} height={36} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">{t.name.charAt(0)}</span>
        )}
      </span>
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold ${nameColor}`}>{t.name}</p>
        {(t.role || t.company) && (
          <p className={`truncate text-xs ${roleColor}`}>{[t.role, t.company].filter(Boolean).join(", ")}</p>
        )}
      </div>
    </div>
  );
}

export function TestimonialsBento({
  testimonials,
  settings,
  preview = false,
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  const title = settings?.homepageTestimonialsTitle?.trim() || DEFAULT_TITLE;
  const subtitle = settings?.homepageTestimonialsSubtitle?.trim() || DEFAULT_SUBTITLE;
  const cta = settings?.homepageTestimonialsCtaText?.trim() || DEFAULT_CTA;
  const ctaLink = settings?.homepageTestimonialsCtaLink?.trim() || DEFAULT_CTA_LINK;
  const stat = settings?.homepageTestimonialsStat?.trim();
  const statLabel = settings?.homepageTestimonialsStatLabel?.trim();

  const rated = testimonials.filter((t) => t.rating);
  const avg = rated.length
    ? (rated.reduce((s, t) => s + (t.rating || 0), 0) / rated.length).toFixed(1)
    : "5.0";

  const [feature, ...rest] = testimonials;

  return (
    <section id="testimonials" className="relative border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <SectionReveal preview={preview} className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="rounded-full border border-border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Testimonials
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">{title}</h2>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </SectionReveal>

        <SectionReveal preview={preview}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[minmax(0,1fr)]">
            {/* Feature card (large) */}
            <article className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 md:col-span-2 md:row-span-2">
              {feature.highlight && (
                <div>
                  <p className="text-6xl font-semibold tracking-tight text-foreground md:text-7xl">{feature.highlight}</p>
                  {feature.highlightLabel && (
                    <p className="mt-2 text-lg font-medium text-foreground">{feature.highlightLabel}</p>
                  )}
                </div>
              )}
              <div className="mt-8">
                <Quote className="h-8 w-8 text-primary/40" />
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">“{feature.quote}”</p>
                <Author t={feature} />
              </div>
            </article>

            {/* Remaining cards */}
            {rest.slice(0, 3).map((t, i) => {
              const invert = i === 2; // one dark contrast card, like the reference
              return (
                <article
                  key={t.id}
                  className={`flex flex-col justify-between rounded-2xl border p-6 ${
                    invert ? "border-foreground bg-foreground" : "border-border bg-card"
                  }`}
                >
                  {t.highlight ? (
                    <p className={`text-4xl font-semibold tracking-tight ${invert ? "text-background" : "text-foreground"}`}>
                      {t.highlight}
                      {t.highlightLabel && (
                        <span className={`mt-1 block text-sm font-medium ${invert ? "text-background/70" : "text-muted-foreground"}`}>
                          {t.highlightLabel}
                        </span>
                      )}
                    </p>
                  ) : (
                    <Quote className={`h-6 w-6 ${invert ? "text-background/50" : "text-primary/40"}`} />
                  )}
                  <div>
                    <p className={`mt-4 text-sm leading-relaxed ${invert ? "text-background/80" : "text-muted-foreground"} line-clamp-3`}>
                      “{t.quote}”
                    </p>
                    <Author t={t} tone={invert ? "invert" : "default"} />
                  </div>
                </article>
              );
            })}
          </div>
        </SectionReveal>

        {/* Footer rating summary */}
        <SectionReveal preview={preview} className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {stat && <span className="text-base font-semibold text-foreground">{stat}</span>}
            <span>{statLabel || "clients love working with me"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </span>
            <span className="text-sm font-medium text-foreground">{avg}</span>
            <span className="text-sm text-muted-foreground">average rating</span>
          </div>
          <a href={ctaLink} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            {cta}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </SectionReveal>
      </div>
    </section>
  );
}
