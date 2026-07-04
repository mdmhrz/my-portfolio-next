'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';

interface FadeAnimationOptions {
  start: boolean;
  reduced: boolean;
  /** Only run when this animation variant is the one currently selected. */
  enabled: boolean;
}

/**
 * A calmer entrance: simple fade + slide-up stagger on `.hero-reveal` and
 * `.hero-char`, no cursor interactivity (no magnetic letters, no magnetic
 * CTA, no 3D tilt). Deliberately much lighter than Signature — a genuinely
 * different mood, not just a re-timed copy.
 */
export function useFadeAnimation(
  sectionRef: RefObject<HTMLElement | null>,
  { start, reduced, enabled }: FadeAnimationOptions,
) {
  useEffect(() => {
    if (!enabled || !start || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-reveal:not(.hero-reveal-heading)',
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power2.out',
          clearProps: 'transform,opacity,visibility',
        },
      );

      gsap.fromTo(
        '.hero-char',
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: { each: 0.02, from: 'start' },
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        },
      );

      // Simple fade for the underline, if the layout has one — no draw-in.
      gsap.fromTo(
        '.hero-underline-path',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: 0.4, ease: 'power1.out' },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [enabled, start, reduced, sectionRef]);
}
