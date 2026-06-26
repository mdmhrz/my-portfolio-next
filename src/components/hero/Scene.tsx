'use client';

import { Suspense, useMemo, type CSSProperties } from 'react';
import { Canvas } from '@react-three/fiber';
import { Aurora } from './Aurora';

// Resolve a CSS custom property to an rgb() string Three.Color can parse.
// Modern browsers return oklch/lab() from getComputedStyle AND from the canvas
// fillStyle getter, both of which Three rejects. Drawing the color and reading
// the pixel back via getImageData always yields plain sRGB bytes.
function cssColor(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const el = document.createElement('span');
  el.style.color = `var(${name})`;
  el.style.display = 'none';
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  el.remove();
  try {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.fillStyle = computed; // browsers accept lab/oklch as an input here
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return fallback;
  }
}

// Derive theme from the resolved background luminance.
function isDarkColor(rgb: string) {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return true;
  const [, r, g, b] = m;
  return 0.2126 * +r + 0.7152 * +g + 0.0722 * +b < 128;
}

export function Scene({ reduced }: { reduced: boolean }) {
  const { base, accent, isDark } = useMemo(() => {
    const base = cssColor('--background', '#0a0a0a');
    const accent = cssColor('--constellation-accent', '#3b82f6');
    return { base, accent, isDark: isDarkColor(base) };
  }, []);

  if (reduced) {
    return (
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isDark
            ? `radial-gradient(80% 60% at 70% 40%, ${accent}22, transparent 70%)`
            : `radial-gradient(80% 60% at 70% 40%, ${accent}18, transparent 70%)`,
        }}
      />
    );
  }

  return (
    <div aria-hidden className="absolute inset-0" style={{ pointerEvents: 'none' } as CSSProperties}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: base }}
      >
        <Suspense fallback={null}>
          <Aurora base={base} accent={accent} isDark={isDark} />
        </Suspense>
      </Canvas>
    </div>
  );
}
