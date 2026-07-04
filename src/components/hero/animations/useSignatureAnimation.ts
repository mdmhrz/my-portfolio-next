'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';

interface SignatureAnimationOptions {
  start: boolean;
  reduced: boolean;
  /** Only run when this animation variant is the one currently selected. */
  enabled: boolean;
}

/**
 * The original hero animation: staggered reveal, character-by-character
 * heading reveal, underline draw-in, magnetic CTA, 3D tilt on the code card,
 * and cursor-magnetic letters. All targeting is done via marker classes
 * scoped to `sectionRef` (`.hero-reveal`, `.hero-char`, `.hero-cta`,
 * `.hero-tilt-target`, `.hero-underline-path`) so it works against any
 * layout that uses the same marker contract, not just LayoutSignature.
 */
export function useSignatureAnimation(
  sectionRef: RefObject<HTMLElement | null>,
  { start, reduced, enabled }: SignatureAnimationOptions,
) {
  // Entrance: reveal elements, underline draw, character reveal.
  useEffect(() => {
    if (!enabled || !start || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-reveal:not(.hero-reveal-heading)',
        { y: 42, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.09,
          ease: 'power3.out',
          delay: 0.1,
          clearProps: 'transform,opacity,visibility',
        },
      );

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

      gsap.fromTo(
        '.hero-char',
        { y: 35, x: 0, scale: 0.8, opacity: 0, filter: 'blur(3px)' },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.4,
          stagger: { each: 0.035, from: 'start' },
          ease: 'power4.out',
          delay: 0.2,
          clearProps: 'transform,opacity,filter',
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [enabled, start, reduced, sectionRef]);

  // Magnetic CTA.
  useEffect(() => {
    if (!enabled || reduced) return;
    const el = sectionRef.current?.querySelector<HTMLElement>('.hero-cta');
    if (!el) return;
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
  }, [enabled, reduced, sectionRef]);

  // 3D tilt on the tilt target (code card / image) following the cursor.
  useEffect(() => {
    if (!enabled || reduced) return;
    const section = sectionRef.current;
    const el = section?.querySelector<HTMLElement>('.hero-tilt-target');
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
  }, [enabled, reduced, sectionRef]);

  // Magnetic letters effect with optimized cached centers to prevent layout thrashing.
  useEffect(() => {
    if (!enabled || !start || reduced) return;
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

    updateCache();

    const onMouseEnter = () => {
      updateCache();
    };

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const isDark = document.documentElement.classList.contains('dark');
      const primary = getComputedStyle(section).getPropertyValue('--primary').trim();
      const activeColor = primary.startsWith('#') ? primary : isDark ? '#6366f1' : '#4f46e5';

      cachedChars.forEach(({ element, cx, cy }) => {
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.hypot(dx, dy);

        const maxDist = 95;

        if (dist < maxDist) {
          const pull = (maxDist - dist) / maxDist;
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
  }, [enabled, start, reduced, sectionRef]);
}
