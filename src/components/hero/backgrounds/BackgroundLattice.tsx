'use client';

import { Suspense, useEffect, useState, type CSSProperties } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import { EnvironmentLattice } from './EnvironmentLattice';

// Resolve a CSS custom property to an rgb() string Three.Color can parse.
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
    ctx.fillStyle = computed;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return fallback;
  }
}

// Check if WebGL is supported by the browser
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function BackgroundLattice({ reduced }: { reduced: boolean }) {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState(() => cssColor('--foreground', '#ffffff'));
  const [bgColor, setBgColor] = useState(() => cssColor('--background', '#000000'));
  const [webglSupported] = useState(() => checkWebGLSupport());

  useEffect(() => {
    // Small delay to allow CSS variables to update after theme switch
    const timeout = setTimeout(() => {
      setColor(cssColor('--foreground', '#ffffff'));
      setBgColor(cssColor('--background', '#000000'));
    }, 50);
    return () => clearTimeout(timeout);
  }, [resolvedTheme]);

  if (reduced || !webglSupported) {
    return <div aria-hidden className="absolute inset-0 bg-background" />;
  }

  return (
    <div aria-hidden className="absolute inset-0" style={{ pointerEvents: 'none' } as CSSProperties}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[bgColor]} />
        <Suspense fallback={null}>
          <EnvironmentLattice color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
}
