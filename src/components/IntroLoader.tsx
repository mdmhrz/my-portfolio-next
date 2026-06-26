'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// A branded intro loader: dual rotating rings + MHR wordmark + a progress bar
// that counts 0→100%, then lifts up like a curtain to reveal the site.
// `onDone` fires as the curtain begins to lift so the hero can start playing.
export function IntroLoader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Respect reduced-motion: skip straight to the site.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false);
      onDone();
      return;
    }

    const counter = { v: 0 };
    const tl = gsap.timeline();

    // Count 0 → 100 with the bar + number following along.
    tl.to(counter, {
      v: 100,
      duration: 1.6,
      ease: 'power1.inOut',
      onUpdate: () => {
        const v = Math.round(counter.v);
        if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
        if (pctRef.current) pctRef.current.textContent = String(v);
      },
    });

    // Tiny hold, then lift the curtain and signal the hero to start.
    tl.to({}, { duration: 0.25 });
    tl.add(() => onDone());
    tl.to(rootRef.current, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power4.inOut',
      onStart: () => {
        if (rootRef.current) rootRef.current.style.pointerEvents = 'none';
      },
      onComplete: () => setVisible(false),
    });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      {/* Dual rotating rings + monogram */}
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border border-foreground/10" />
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-foreground"
          style={{ animationDuration: '1.1s' }}
        />
        <div
          className="absolute inset-[10px] animate-spin rounded-full border-2 border-transparent border-b-foreground/40"
          style={{ animationDuration: '1.7s', animationDirection: 'reverse' }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold tracking-[0.2em] text-foreground">
          MHR
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-8 h-px w-56 overflow-hidden bg-foreground/15">
        <div
          ref={barRef}
          className="h-full w-full origin-left scale-x-0 bg-foreground"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-3 font-mono text-[11px] tracking-wide text-muted-foreground">
        <span ref={pctRef}>0</span>% · loading experience
      </div>
    </div>
  );
}
