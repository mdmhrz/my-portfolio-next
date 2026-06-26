'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { GithubLogo, LinkedinLogo, FacebookLogo, EnvelopeSimple } from '@phosphor-icons/react';
import { Terminal } from './Terminal';
import { CodeCard } from './CodeCard';

// WebGL never ships to the server bundle.
const Scene = dynamic(() => import('./Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => null,
});

const CHIPS = ['Frontend Dev @ Xgenious', 'SaaS · CRM · Shopify Apps', 'Docker · AWS · CI/CD'];

const SOCIALS = [
  { Icon: GithubLogo, href: 'https://github.com/mdmhrz', label: 'GitHub' },
  { Icon: LinkedinLogo, href: 'https://www.linkedin.com/in/mdmhrz', label: 'LinkedIn' },
  { Icon: FacebookLogo, href: 'https://www.facebook.com/mdmhrz', label: 'Facebook' },
  { Icon: EnvelopeSimple, href: 'mailto:mdmobarakhossainrazu@gmail.com', label: 'Email' },
];

export function Hero({ start, reduced = false }: { start: boolean; reduced?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Entrance — only plays once the loader has signalled `start`.
  useEffect(() => {
    if (!start || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-reveal', {
        y: 42,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power3.out',
        delay: 0.1,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [start, reduced]);

  // Magnetic CTA.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || reduced) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: x * 0.3, y: y * 0.4, duration: 0.6, ease: 'power3.out' });
    };
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [reduced]);

  // 3D tilt on the code card following the cursor.
  useEffect(() => {
    if (reduced) return;
    const el = cardWrapRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;
    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotationY: px * 16,
        rotationX: -py * 12,
        transformPerspective: 900,
        duration: 0.6,
        ease: 'power2.out',
      });
    };
    section.addEventListener('mousemove', onMove);
    return () => section.removeEventListener('mousemove', onMove);
  }, [reduced]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden bg-background"
    >
      {/* WebGL: black & white interactive 3D environment */}
      <Scene reduced={reduced} />

      {/* Left-side vignette keeps foreground text legible over the 3D */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(120% 80% at 0% 50%, color-mix(in oklch, var(--background) 78%, transparent) 0%, transparent 55%)',
        }}
      />

      <div className="container relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 pt-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: identity */}
          <div className="max-w-xl">
            <div className="hero-reveal mb-6">
              <Terminal />
            </div>

            <p className="hero-reveal mb-3 font-mono text-base uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              Mobarak Hossain Razu
            </p>

            <h1 className="hero-reveal text-5xl font-medium leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Full-Stack{' '}
              <span className="relative inline-block">
                Developer
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-foreground" />
              </span>
            </h1>

            <p className="hero-reveal mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              I build production SaaS, CRM, and full-stack web apps — from Next.js interfaces to
              Node.js &amp; Go APIs, PostgreSQL, and Docker-on-AWS deployments.
            </p>

            <div className="hero-reveal mt-8 flex flex-col gap-2">
              {CHIPS.map((c) => (
                <div key={c} className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-foreground" />
                  {c}
                </div>
              ))}
            </div>

            <div className="hero-reveal mt-10 flex items-center gap-6">
              <a
                ref={ctaRef}
                href="#work"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                View work
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <div className="flex items-center gap-4 text-muted-foreground">
                {SOCIALS.map(({ Icon, href, label }) => (
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
          <div ref={cardWrapRef} className="hero-reveal flex justify-center lg:justify-end" style={{ transformStyle: 'preserve-3d' }}>
            <CodeCard start={start} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-4 opacity-70 md:flex">
        <span className="text-xs text-muted-foreground">Scroll</span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground p-1">
          <div className="h-1.5 w-1 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      </div>
    </section>
  );
}
