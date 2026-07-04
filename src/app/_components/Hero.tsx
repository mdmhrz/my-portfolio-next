'use client';

import { useRef } from 'react';
import {
  renderHeroBackground,
  renderHeroLayout,
  useHeroAnimation,
  normalizeBackground,
  normalizeLayout,
  normalizeAnimation,
  type HeroBannerData,
  type HeroProfileData,
} from '@/components/hero';

interface HeroProps {
  start: boolean;
  reduced?: boolean;
  banner?: HeroBannerData | null;
  profile?: HeroProfileData | null;
  /** Set to false when embedding Hero in a constrained box (e.g. the dashboard live preview) instead of a full-viewport section. */
  fullHeight?: boolean;
}

export function Hero({ start, reduced = false, banner, profile, fullHeight = true }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const backgroundType = normalizeBackground(banner?.backgroundTemplate);
  const layoutType = normalizeLayout(banner?.layoutTemplate);
  const animationType = normalizeAnimation(banner?.animationTemplate);

  useHeroAnimation(animationType, sectionRef, { start, reduced });

  return (
    <section
      id={fullHeight ? 'home' : undefined}
      ref={sectionRef}
      className={`relative w-full overflow-hidden bg-background select-none ${fullHeight ? 'min-h-[100svh]' : 'h-full'}`}
    >
      {renderHeroBackground(backgroundType, { reduced, banner })}

      {/* Left-side vignette keeps foreground text legible over any background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(120% 80% at 0% 50%, color-mix(in oklch, var(--background) 78%, transparent) 0%, transparent 55%)',
        }}
      />

      {renderHeroLayout(layoutType, { start, fullHeight, banner, profile })}

      {/* Scroll indicator */}
      {fullHeight && (
        <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-4 opacity-70 md:flex">
          <span className="text-xs text-muted-foreground">Scroll</span>
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground p-1">
            <div className="h-1.5 w-1 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      )}
    </section>
  );
}
