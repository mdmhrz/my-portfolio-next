'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  y?: number;
  delay?: number;
  duration?: number;
  start?: string;
  blur?: boolean;
  style?: CSSProperties;
};

// Shared scroll-reveal wrapper used across every section for a consistent
// entrance: a gentle rise + fade (optional blur) when scrolled into view.
// Reduced-motion users see content immediately with no transform.
export function Reveal({
  children,
  className,
  as,
  y = 28,
  delay = 0,
  duration = 0.8,
  start = 'top 85%',
  blur = false,
  style,
}: RevealProps) {
  const Tag = ((as || 'div') as ElementType) as React.ComponentType<ComponentPropsWithoutRef<ElementType>>;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, autoAlpha: 0, filter: blur ? 'blur(8px)' : 'none' },
        {
          y: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    });
    return () => ctx.revert();
  }, [y, delay, duration, start, blur]);

  return (
    <Tag ref={ref} className={cn(className)} style={style}>
      {children}
    </Tag>
  );
}
