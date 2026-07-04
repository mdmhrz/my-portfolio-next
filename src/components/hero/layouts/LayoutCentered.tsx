'use client';

import { ArrowUpRight } from 'lucide-react';
import { GithubLogo, LinkedinLogo, FacebookLogo, EnvelopeSimple } from '@phosphor-icons/react';
import { Magnetic } from '@/components/global/Magnetic';
import { splitWords } from '../splitWords';
import type { HeroBannerData, HeroProfileData } from '../types';

const CHIPS = ['Frontend Dev @ Xgenious', 'SaaS · CRM · Shopify Apps', 'Docker · AWS · CI/CD'];

interface LayoutCenteredProps {
  start: boolean;
  fullHeight?: boolean;
  banner?: HeroBannerData | null;
  profile?: HeroProfileData | null;
}

// A single centered column — no code card, no side visual. Deliberately the
// calmest, most minimal layout: just the words, centered, with room to breathe.
export function LayoutCentered({ fullHeight = true, banner, profile }: LayoutCenteredProps) {
  const name = banner?.headline || 'Mobarak Hossain Razu';
  const title = banner?.subtitle || 'Full-Stack Developer';
  const description = banner?.description || "I build production SaaS, CRM, and full-stack web apps — from Next.js interfaces to Node.js & Go APIs, PostgreSQL, and Docker-on-AWS deployments.";
  const chips = banner?.chips?.length ? banner.chips : CHIPS;
  const ctaLabel = banner?.ctaLabel || 'View work';
  const ctaHref = banner?.ctaHref || '#work';

  const socialsList = [
    profile?.github && { Icon: GithubLogo, href: profile.github, label: 'GitHub' },
    profile?.linkedin && { Icon: LinkedinLogo, href: profile.linkedin, label: 'LinkedIn' },
    profile?.facebook && { Icon: FacebookLogo, href: profile.facebook, label: 'Facebook' },
    profile?.email && { Icon: EnvelopeSimple, href: `mailto:${profile.email}`, label: 'Email' },
  ].filter(Boolean) as { Icon: any; href: string; label: string }[];

  return (
    <div className={`container relative z-10 mx-auto flex ${fullHeight ? 'min-h-[100svh]' : 'h-full'} max-w-4xl flex-col items-center justify-center px-6 pt-24 pb-16 text-center md:pb-0`}>
      <p className="hero-reveal mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
        {name}
      </p>

      <h1 className="hero-reveal hero-reveal-heading text-4xl font-medium leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
        {splitWords(title)}
      </h1>

      <p className="hero-reveal mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
        {description}
      </p>

      <div className="hero-reveal mt-8 flex flex-wrap items-center justify-center gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="hero-reveal mt-10 flex flex-col items-center gap-6">
        <Magnetic>
          <a
            href={ctaHref}
            className="hero-cta group inline-flex h-12 items-center gap-2 rounded-full bg-primary hover:bg-primary/90 px-7 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_25%,transparent)]"
          >
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Magnetic>

        <div className="flex items-center gap-4 text-muted-foreground">
          {socialsList.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              <Icon className="h-[18px] w-[18px]" weight="regular" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
