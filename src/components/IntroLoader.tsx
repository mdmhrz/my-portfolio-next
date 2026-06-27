'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'motion/react';

// A branded next-level intro loader: custom SVG monogram tracing + glowing progress bar
// + character sequential loading text reveal.
export function IntroLoader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  
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

    // Set initial dash offsets
    if (path1Ref.current) {
      path1Ref.current.style.strokeDasharray = '800';
      path1Ref.current.style.strokeDashoffset = '800';
    }
    if (path2Ref.current) {
      path2Ref.current.style.strokeDasharray = '300';
      path2Ref.current.style.strokeDashoffset = '300';
    }
    if (path3Ref.current) {
      path3Ref.current.style.strokeDasharray = '800';
      path3Ref.current.style.strokeDashoffset = '800';
    }
    if (rectRef.current) {
      rectRef.current.style.strokeDasharray = '200';
      rectRef.current.style.strokeDashoffset = '200';
    }

    // Parallel animations: count to 100, fill progress bar
    tl.to(counter, {
      v: 100,
      duration: 2.2,
      ease: 'power2.out',
      onUpdate: () => {
        const v = Math.round(counter.v);
        if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
        if (pctRef.current) pctRef.current.textContent = String(v);
      },
    }, 0);

    // Outline tracing animations
    tl.to(path1Ref.current, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: 'power1.inOut',
    }, 0.1);

    tl.to(path2Ref.current, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power1.inOut',
    }, 0.2);

    tl.to(path3Ref.current, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: 'power1.inOut',
    }, 0.3);

    tl.to(rectRef.current, {
      strokeDashoffset: 0,
      duration: 1.0,
      ease: 'power1.inOut',
    }, 0.4);

    // Fade in the solid path fills
    tl.to([path1Ref.current, path2Ref.current, path3Ref.current, rectRef.current], {
      fillOpacity: 1,
      duration: 0.8,
      ease: 'power1.out',
    }, 1.2);

    // Hold, then lift curtain
    tl.to({}, { duration: 0.2 });
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
      {/* Premium SVG Monogram Tracing */}
      <div className="relative h-28 w-28 flex items-center justify-center">
        <svg
          viewBox="0 0 205 165.4"
          role="img"
          aria-label="MHR logo"
          className="h-20 w-auto text-foreground logo-svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g>
            <path
              ref={path1Ref}
              fill="currentColor"
              fillOpacity="0"
              d="M82.4,125l-11.9,11.9c-2.3,2.3-5.9,2.3-8.2,0l0,0l-16-16l-4.1-4.1l-16-16l-4.1-4.1L10.2,84.8
                c-2.3-2.3-2.3-5.9,0-8.2l11.9-11.9l4.1-4.1l16-16l4.1-4.1l11.9-11.9c2.3-2.3,5.9-2.3,8.2,0l11.9,11.9l-16,16l-4.1,4.1l-16,16
                l-4.1,4.1l4.1,4.1l16,16l4.1,4.1l16,16L82.4,125z"
            />
            <path
              ref={path2Ref}
              fill="currentColor"
              fillOpacity="0"
              d="M98.4,60.6L86.5,72.5c-2.3,2.3-5.9,2.3-8.2,0L66.4,60.6l11.9-11.9c2.3-2.3,5.9-2.3,8.2,0
                L98.4,60.6z"
            />
            <path
              ref={path3Ref}
              fill="currentColor"
              fillOpacity="0"
              d="M194.8,76.6c2.3,2.3,2.3,5.9,0,8.2l-11.9,11.9l-4.1,4.1l-32,32c-2.3,2.3-5.9,2.3-8.2,0
                l-11.9-11.9l20.1-20.1l16-16l4.1-4.1l-4.1-4.1l-16-16l-4.1-4.1l-4.1,4.1l-16,16l-4.1,4.1l-11.9,11.9c-2.3,2.3-5.9,2.3-8.2,0
                L86.5,80.7l16-16l4.1-4.1l16-16l4.1-4.1l11.9-11.9c2.3-2.3,5.9-2.3,8.2,0l11.9,11.9l4.1,4.1l16,16l4.1,4.1L194.8,76.6z"
            />
            <rect
              ref={rectRef}
              x="125.5"
              y="75.2"
              transform="matrix(0.7071 -0.7071 0.7071 0.7071 -21.1265 122.102)"
              fill="currentColor"
              fillOpacity="0"
              width="22.6"
              height="22.6"
            />
          </g>
        </svg>
        <div className="absolute inset-0 rounded-full border border-foreground/5 animate-pulse" />
      </div>

      {/* Progress bar with Indigo Glow */}
      <div className="mt-8 h-[2px] w-56 overflow-hidden bg-foreground/10 rounded-full">
        <div
          ref={barRef}
          className="h-full w-full origin-left scale-x-0 bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Percentage Counter */}
      <div className="mt-4 font-mono text-[11px] tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 uppercase font-semibold">
        <span>[</span>
        <span ref={pctRef} className="text-foreground font-bold min-w-[24px] text-right">0</span>
        <span>% ]</span>
        <span className="text-muted-foreground/30">•</span>
        <span className="flex overflow-hidden text-indigo-600 dark:text-indigo-400">
          {"INITIALIZING PORTFOLIO".split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{
                delay: 0.15 + index * 0.025,
                duration: 0.45,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </span>
      </div>
    </div>
  );
}
