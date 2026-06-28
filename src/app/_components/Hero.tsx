'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Atom, Database } from 'lucide-react';
import { GithubLogo, LinkedinLogo, FacebookLogo, EnvelopeSimple } from '@phosphor-icons/react';
import { Terminal } from './Terminal';
import { CodeCard } from './CodeCard';

import { Magnetic } from '@/components/global/Magnetic';

// WebGL never ships to the server bundle.
const Scene = dynamic(() => import('./Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => null,
});

interface BannerProp {
  name: string;
  title: string;
  description: string;
  chips: string[];
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  email?: string | null;
}

const CHIPS = ['Frontend Dev @ Xgenious', 'SaaS · CRM · Shopify Apps', 'Docker · AWS · CI/CD'];

const splitText = (text: string) => {
  return text.split('').map((char, index) => (
    <span
      key={index}
      className="inline-block hero-char"
      style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
    >
      {char === ' ' ? '\u00A0' : char}
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
      className="relative flex items-center gap-2 rounded-full border border-foreground/10 bg-card/65 dark:bg-card/45 px-3.5 py-1.5 text-[11px] font-mono font-medium text-muted-foreground transition-all duration-300 hover:border-indigo-500/50 hover:text-foreground hover:shadow-[0_0_15px_rgba(99,102,241,0.06)] backdrop-blur overflow-hidden group/pill cursor-default"
    >
      {/* Spotlight glow border overlay */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover/pill:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(75px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.15), transparent 80%)',
          border: '1px solid rgba(99, 102, 241, 0.4)'
        }}
      />
      <div className="relative z-10 flex items-center justify-center">
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </div>
  );
}

export function Hero({ start, reduced = false, banner }: { start: boolean; reduced?: boolean; banner?: BannerProp | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const name = banner?.name || "Mobarak Hossain Razu";
  const title = banner?.title || "Full-Stack Developer";
  const description = banner?.description || "I build production SaaS, CRM, and full-stack web apps — from Next.js interfaces to Node.js & Go APIs, PostgreSQL, and Docker-on-AWS deployments.";
  
  // Split title into first word and remaining words for stylized underline decoration
  const titleParts = title.split(" ");
  const titleFirstWord = titleParts[0] || "";
  const titleRemainingWords = titleParts.slice(1).join(" ") || "";

  const socialsList = [
    banner?.github && { Icon: GithubLogo, href: banner.github, label: 'GitHub' },
    banner?.linkedin && { Icon: LinkedinLogo, href: banner.linkedin, label: 'LinkedIn' },
    banner?.facebook && { Icon: FacebookLogo, href: banner.facebook, label: 'Facebook' },
    banner?.email && { Icon: EnvelopeSimple, href: `mailto:${banner.email}`, label: 'Email' },
  ].filter(Boolean) as { Icon: any; href: string; label: string }[];

  // Entrance — only plays once the loader has signalled `start`.
  useEffect(() => {
    if (!start || reduced) return;
    const ctx = gsap.context(() => {
      // General hero-reveal elements (excluding the heading characters)
      gsap.fromTo(
        '.hero-reveal:not(.hero-reveal-heading)',
        {
          y: 42,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.09,
          ease: 'power3.out',
          delay: 0.1,
          clearProps: 'transform,opacity,visibility',
        }
      );

      // Set initial states for underline path and animate it draw-in
      const path = sectionRef.current?.querySelector('.hero-underline-path') as SVGPathElement | null;
      if (path) {
        try {
          const length = path.getTotalLength();
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.out',
            delay: 1.0,
          });
        } catch (e) {
          console.error(e);
        }
      }

      // Staggered letters reveal
      gsap.fromTo(
        '.hero-char',
        {
          y: 35,
          x: 0,
          scale: 0.8,
          opacity: 0,
          filter: 'blur(3px)',
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.4,
          stagger: {
            each: 0.035,
            from: 'start',
          },
          ease: 'power4.out',
          delay: 0.2,
          clearProps: 'transform,opacity,filter',
        }
      );
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

  // Magnetic letters effect with optimized cached centers to prevent layout thrashing
  useEffect(() => {
    if (!start || reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    const chars = section.querySelectorAll('.hero-char');

    interface CharCache {
      element: HTMLElement;
      cx: number; // clean rest center X
      cy: number; // clean rest center Y
    }

    let cachedChars: CharCache[] = [];

    const updateCache = () => {
      cachedChars = Array.from(chars).map((char) => {
        const el = char as HTMLElement;
        const rect = el.getBoundingClientRect();
        // Subtract any current GSAP offsets to get the clean rest center
        const xOffset = (gsap.getProperty(el, 'x') as number) || 0;
        const yOffset = (gsap.getProperty(el, 'y') as number) || 0;
        return {
          element: el,
          cx: rect.left + rect.width / 2 - xOffset,
          cy: rect.top + rect.height / 2 - yOffset,
        };
      });
    };

    // Initialize cache
    updateCache();

    const onMouseEnter = () => {
      // Refresh cache when cursor enters to ensure positions are correct
      updateCache();
    };

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const isDark = document.documentElement.classList.contains('dark');
      const activeColor = isDark ? '#6366f1' : '#4f46e5';

      cachedChars.forEach(({ element, cx, cy }) => {
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.hypot(dx, dy);

        // Magnetic activation radius (95px)
        const maxDist = 95;

        if (dist < maxDist) {
          const pull = (maxDist - dist) / maxDist; // 0 (far) to 1 (near)
          // Lift letter up and pull toward the cursor slightly
          const x = dx * pull * 0.35;
          const y = dy * pull * 0.35 - pull * 10.0;

          gsap.to(element, {
            x,
            y,
            scale: 1.18,
            color: activeColor,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(element, {
            x: 0,
            y: 0,
            scale: 1,
            color: '',
            duration: 0.65,
            ease: 'elastic.out(1.1, 0.4)',
            overwrite: 'auto',
          });
        }
      });
    };

    const onMouseLeave = () => {
      cachedChars.forEach(({ element }) => {
        gsap.to(element, {
          x: 0,
          y: 0,
          scale: 1,
          color: '',
          duration: 0.8,
          ease: 'elastic.out(1.1, 0.3)',
          overwrite: 'auto',
        });
      });
    };

    section.addEventListener('mouseenter', onMouseEnter);
    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', updateCache);

    return () => {
      section.removeEventListener('mouseenter', onMouseEnter);
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', updateCache);
    };
  }, [start, reduced]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden bg-background select-none"
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

      <div className="container relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-6 pt-24 pb-16 md:pb-0">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: identity */}
          <div className="max-w-xl">
            <div className="hero-reveal mb-6">
              <Terminal />
            </div>

            <p className="hero-reveal mb-3 font-mono text-base uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              {name}
            </p>

            <h1 className="hero-reveal hero-reveal-heading text-5xl font-medium leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              <span className="word-wrapper inline-block">
                {splitText(titleFirstWord)}
              </span>{' '}
              <span className="word-wrapper relative inline-block">
                {splitText(titleRemainingWords)}
                <svg
                  className="absolute -bottom-3.5 left-0 h-[10px] w-full pointer-events-none"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    className="hero-underline-path stroke-indigo-600 dark:stroke-indigo-500"
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
                let icon = <Atom className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-[spin_8s_linear_infinite] group-hover/pill:animate-[spin_1.5s_linear_infinite] transition-all duration-300" />;
                if (idx === 1) {
                  icon = (
                    <div className="flex items-end gap-[2px] h-3 w-3 mb-[1px]">
                      <span className="w-[2.5px] bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300 h-2 group-hover/pill:h-3" />
                      <span className="w-[2.5px] bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300 h-3 group-hover/pill:h-1" />
                      <span className="w-[2.5px] bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300 h-1.5 group-hover/pill:h-2.5" />
                    </div>
                  );
                } else if (idx >= 2) {
                  icon = (
                    <div className="relative flex items-center justify-center">
                      <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover/pill:scale-110" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
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
                  ref={ctaRef}
                  href="#work"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-7 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
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
          <div ref={cardWrapRef} className="hero-reveal flex justify-center lg:justify-end" style={{ transformStyle: 'preserve-3d' }}>
            <CodeCard start={start} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-4 opacity-70 md:flex">
        <span className="text-xs text-muted-foreground">Scroll</span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground p-1">
          <div className="h-1.5 w-1 animate-bounce rounded-full bg-indigo-600 dark:bg-indigo-500" />
        </div>
      </div>
    </section>
  );
}
