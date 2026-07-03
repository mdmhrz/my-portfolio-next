'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Animated code lines
  const codeLines = [
    '> npm run build',
    '$ yarn dev',
    '[ ERROR ] Page not found',
    '[ CODE ] 404',
    '> git log',
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate 404 text with stagger
      const chars = titleRef.current?.querySelectorAll('.digit');
      if (chars) {
        gsap.fromTo(
          chars,
          {
            y: 50,
            opacity: 0,
            scale: 0.8,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            delay: 0.2,
          }
        );
      }

      // Animate description
      gsap.fromTo(
        '.not-found-reveal',
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.5,
        }
      );

      // Animate code blocks with typing effect
      const codeElements = sectionRef.current?.querySelectorAll('.code-line');
      if (codeElements) {
        gsap.fromTo(
          codeElements,
          {
            opacity: 0,
            x: -30,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            delay: 1.2,
          }
        );
      }

      // Blink cursor
      gsap.to('.cursor', {
        opacity: 0.3,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });

      // Floating animation for the main section
      gsap.fromTo(
        '.floating-element',
        {
          y: 0,
        },
        {
          y: -15,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex items-center justify-center px-6"
    >
      {/* Animated background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl">
        {/* Main content */}
        <div className="text-center mb-12">
          {/* 404 Number */}
          <div
            ref={titleRef}
            className="mb-8 flex items-center justify-center gap-3 font-sans text-8xl sm:text-9xl font-black tracking-tighter"
          >
            <span className="digit text-foreground">4</span>
            <span className="digit relative">
              <span className="text-primary dark:text-primary animate-pulse">0</span>
              <span className="cursor absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-16 bg-primary dark:bg-primary" />
            </span>
            <span className="digit text-foreground">4</span>
          </div>

          {/* Description */}
          <div className="space-y-3 mb-10">
            <h1 className="not-found-reveal text-3xl sm:text-4xl font-bold tracking-tight">
              Lost in the digital void
            </h1>
            <p className="not-found-reveal max-w-lg mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              Looks like you've ventured into uncharted territory. This page doesn't exist in my codebase.
            </p>
          </div>

          {/* Code block styled as terminal */}
          <div className="floating-element not-found-reveal bg-card/50 backdrop-blur border border-foreground/10 rounded-lg p-6 sm:p-8 mb-10 max-w-2xl mx-auto overflow-hidden">
            <div className="space-y-2 font-mono text-sm text-left">
              {codeLines.map((line, idx) => (
                <div
                  key={idx}
                  className="code-line flex items-start gap-2 text-muted-foreground"
                >
                  {line.startsWith('[') ? (
                    <>
                      <span className="text-red-500 dark:text-red-400 font-semibold">
                        {line.split(']')[0]}]
                      </span>
                      <span className="text-muted-foreground">
                        {line.substring(line.split(']')[0].length + 1)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-primary dark:text-primary select-none">
                        {line.substring(0, line.indexOf(' '))}
                      </span>
                      <span>{line.substring(line.indexOf(' ') + 1)}</span>
                    </>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2 text-primary dark:text-primary">
                <span>$</span>
                <span className="cursor">_</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="not-found-reveal flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary hover:bg-primary/90 px-8 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_30%,transparent)]"
            >
              <ArrowUpLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              Back to home
            </Link>

            <Link
              href="/blogs"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-foreground/20 hover:border-primary/50 hover:bg-primary/5 px-8 text-sm font-medium text-foreground transition-all duration-300"
            >
              Read blog posts
            </Link>
          </div>
        </div>

        {/* Floating code snippets - decorative */}
        <div className="not-found-reveal absolute top-1/4 -left-20 sm:left-0 opacity-30 text-xs font-mono text-primary/40 dark:text-primary/30 hidden sm:block max-w-[150px] break-words">
          <div className="whitespace-pre-wrap">
            {`const navigate = () => {
  return home();
}`}
          </div>
        </div>

        <div className="not-found-reveal absolute bottom-1/4 -right-20 sm:right-0 opacity-30 text-xs font-mono text-primary/40 dark:text-primary/30 hidden sm:block max-w-[150px] break-words">
          <div className="whitespace-pre-wrap">
            {`try {
  findPage();
} catch {
  404
}`}
          </div>
        </div>
      </div>
    </div>
  );
}
