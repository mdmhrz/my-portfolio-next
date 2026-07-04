'use client';

import { ArrowUpRight, Atom, Database } from 'lucide-react';
import { GithubLogo, LinkedinLogo, FacebookLogo, EnvelopeSimple } from '@phosphor-icons/react';
import { Terminal } from '@/app/_components/Terminal';
import { CodeCard } from '@/app/_components/CodeCard';
import { Magnetic } from '@/components/global/Magnetic';
import type { HeroBannerData, HeroProfileData } from '../types';

const CHIPS = ['Frontend Dev @ Xgenious', 'SaaS · CRM · Shopify Apps', 'Docker · AWS · CI/CD'];

const splitText = (text: string) => {
  return text.split('').map((char, index) => (
    <span
      key={index}
      className="inline-block hero-char"
      style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
    >
      {char === ' ' ? ' ' : char}
    </span>
  ));
};

function TechPill({ label, icon }: { label: string; icon: React.ReactNode }) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative flex items-center gap-2 rounded-full border border-foreground/10 bg-card/65 dark:bg-card/45 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground hover:shadow-[0_0_15px_color-mix(in_oklch,var(--primary)_8%,transparent)] backdrop-blur overflow-hidden group/pill cursor-default"
    >
      {/* Spotlight glow border overlay */}
      <div
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover/pill:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(75px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), color-mix(in oklch, var(--primary) 15%, transparent), transparent 80%)',
          border: '1px solid color-mix(in oklch, var(--primary) 40%, transparent)'
        }}
      />
      <div className="relative z-10 flex items-center justify-center">
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </div>
  );
}

interface LayoutSignatureProps {
  start: boolean;
  fullHeight?: boolean;
  banner?: HeroBannerData | null;
  profile?: HeroProfileData | null;
}

export function LayoutSignature({ start, fullHeight = true, banner, profile }: LayoutSignatureProps) {
  const name = profile?.name || "Mobarak Hossain Razu";
  const title = profile?.designation || "Full-Stack Developer";
  const description = banner?.description || "I build production SaaS, CRM, and full-stack web apps — from Next.js interfaces to Node.js & Go APIs, PostgreSQL, and Docker-on-AWS deployments.";

  // Split title into first word and remaining words for stylized underline decoration
  const titleParts = title.split(" ");
  const titleFirstWord = titleParts[0] || "";
  const titleRemainingWords = titleParts.slice(1).join(" ") || "";

  const socialsList = [
    profile?.github && { Icon: GithubLogo, href: profile.github, label: 'GitHub' },
    profile?.linkedin && { Icon: LinkedinLogo, href: profile.linkedin, label: 'LinkedIn' },
    profile?.facebook && { Icon: FacebookLogo, href: profile.facebook, label: 'Facebook' },
    profile?.email && { Icon: EnvelopeSimple, href: `mailto:${profile.email}`, label: 'Email' },
  ].filter(Boolean) as { Icon: any; href: string; label: string }[];

  return (
    <div className={`container relative z-10 mx-auto flex ${fullHeight ? 'min-h-[100svh]' : 'h-full'} max-w-7xl flex-col justify-center px-6 pt-24 pb-16 md:pb-0`}>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left: identity */}
        <div className="max-w-xl">
          <div className="hero-reveal mb-6">
            <Terminal />
          </div>

          <p className="hero-reveal mb-3 font-sans text-base uppercase tracking-[0.25em] text-muted-foreground font-semibold">
            {name}
          </p>

          <h1 className="hero-reveal hero-reveal-heading text-5xl font-medium leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            <span className="word-wrapper inline-block whitespace-nowrap">
              {splitText(titleFirstWord)}
            </span>{' '}
            <span className="word-wrapper relative inline-block whitespace-nowrap">
              {splitText(titleRemainingWords)}
              <svg
                className="absolute -bottom-3.5 left-0 h-[10px] w-full pointer-events-none"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  className="hero-underline-path stroke-primary"
                  d="M 2,6 C 20,3 40,3 60,5 C 75,6.5 90,4.5 98,3.5"
                  fill="none"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="hero-reveal mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>

          <div className="hero-reveal mt-8 flex flex-wrap gap-2.5">
            {(banner?.chips || CHIPS).map((chip, idx) => {
              let icon = <Atom className="h-3.5 w-3.5 text-primary animate-[spin_8s_linear_infinite] group-hover/pill:animate-[spin_1.5s_linear_infinite] transition-all duration-300" />;
              if (idx === 1) {
                icon = (
                  <div className="flex items-end gap-[2px] h-3 w-3 mb-[1px]">
                    <span className="w-[2.5px] bg-primary rounded-full transition-all duration-300 h-2 group-hover/pill:h-3" />
                    <span className="w-[2.5px] bg-primary rounded-full transition-all duration-300 h-3 group-hover/pill:h-1" />
                    <span className="w-[2.5px] bg-primary rounded-full transition-all duration-300 h-1.5 group-hover/pill:h-2.5" />
                  </div>
                );
              } else if (idx >= 2) {
                icon = (
                  <div className="relative flex items-center justify-center">
                    <Database className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover/pill:scale-110" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                  </div>
                );
              }
              return <TechPill key={chip} label={chip} icon={icon} />;
            })}
          </div>

          <div className="hero-reveal mt-10 flex items-center gap-6">
            <Magnetic>
              <a
                href="#work"
                className="hero-cta group inline-flex h-12 items-center gap-2 rounded-full bg-primary hover:bg-primary/90 px-7 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_25%,transparent)]"
              >
                View work
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

        {/* Right: typing terminal card */}
        <div className="hero-reveal hero-tilt-target flex justify-center lg:justify-end" style={{ transformStyle: 'preserve-3d' }}>
          <CodeCard start={start} />
        </div>
      </div>
    </div>
  );
}
