'use client';

import { useLayoutEffect, useRef, useState } from 'react';

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 760;

interface ScaledPreviewProps {
  children: React.ReactNode;
}

/**
 * Renders children at a fixed "design" resolution and scales the whole thing
 * down to fit the actual container width. This guarantees the full hero is
 * always visible — no layout/font-size combination can ever get clipped by
 * an undersized fixed-height box, and it stays correctly proportioned at any
 * viewport width.
 */
export function ScaledPreview({ children }: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-background"
      style={
        scale
          ? { height: DESIGN_HEIGHT * scale }
          : { aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }
      }
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale || 0.001})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}
