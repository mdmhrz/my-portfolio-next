'use client';

import Image from 'next/image';
import { ArrowUpRight, ImageIcon } from 'lucide-react';
import { GithubLogo, LinkedinLogo, FacebookLogo, EnvelopeSimple } from '@phosphor-icons/react';
import { Magnetic } from '@/components/global/Magnetic';
import { splitWords } from '../splitWords';
import type { HeroBannerData, HeroProfileData } from '../types';

const CHIPS = ['Frontend Dev @ Xgenious', 'SaaS · CRM · Shopify Apps', 'Docker · AWS · CI/CD'];

interface LayoutShowcaseProps {
  start: boolean;
  fullHeight?: boolean;
  banner?: HeroBannerData | null;
  profile?: HeroProfileData | null;
}

export function LayoutShowcase({ fullHeight = true, banner, profile }: LayoutShowcaseProps) {
  const name = banner?.headline || 'Mobarak Hossain Razu';
  const title = banner?.subtitle || 'Full-Stack Developer';
  const description = banner?.description || "I build production SaaS, CRM, and full-stack web apps — from Next.js interfaces to Node.js & Go APIs, PostgreSQL, and Docker-on-AWS deployments.";
  const chips = banner?.chips?.length ? banner.chips : CHIPS;
  const ctaLabel = banner?.ctaLabel || 'View work';
  const ctaHref = banner?.ctaHref || '#work';
  const imageOnRight = banner?.showcaseImageSide === 'right';

  const socialsList = [
    profile?.github && { Icon: GithubLogo, href: profile.github, label: 'GitHub' },
    profile?.linkedin && { Icon: LinkedinLogo, href: profile.linkedin, label: 'LinkedIn' },
    profile?.facebook && { Icon: FacebookLogo, href: profile.facebook, label: 'Facebook' },
    profile?.email && { Icon: EnvelopeSimple, href: `mailto:${profile.email}`, label: 'Email' },
  ].filter(Boolean) as { Icon: any; href: string; label: string }[];

  return (
    <div className={`container relative z-10 mx-auto flex ${fullHeight ? 'min-h-[100svh]' : 'h-full'} max-w-7xl flex-col justify-center px-6 pt-24 pb-16 md:pb-0`}>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Showcase image */}
        <div
          className={`hero-reveal hero-tilt-target order-2 flex justify-center ${imageOnRight ? 'lg:order-2 lg:justify-end' : 'lg:order-1 lg:justify-start'}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
            {banner?.heroImage ? (
              <Image
                src={banner.heroImage}
                alt={banner.heroImageAlt || name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 to-indigo-500/10 text-muted-foreground">
                <ImageIcon className="h-10 w-10" />
                <span className="text-xs font-medium">No showcase image set</span>
              </div>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className={`order-1 max-w-xl ${imageOnRight ? 'lg:order-1' : 'lg:order-2'}`}>
          <p className="hero-reveal mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {title}
          </p>

          <h1 className="hero-reveal hero-reveal-heading text-5xl font-medium leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            {splitWords(name)}
          </h1>

          <p className="hero-reveal mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>

          <div className="hero-reveal mt-8 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="hero-reveal mt-10 flex items-center gap-6">
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
      </div>
    </div>
  );
}
