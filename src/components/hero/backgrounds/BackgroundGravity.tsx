'use client';

import { Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import { EnvironmentGravity } from './EnvironmentGravity';

function cssColor(name: string, fallback: string, root?: HTMLElement | null) {
  if (typeof window === 'undefined') return fallback;
  const el = document.createElement('span');
  el.style.color = `var(${name})`;
  el.style.display = 'none';
  (root ?? document.body).appendChild(el);
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

export function BackgroundGravity({ reduced }: { reduced: boolean }) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#000000');
  const [webglSupported] = useState(() => checkWebGLSupport());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setColor(cssColor('--foreground', '#ffffff', containerRef.current));
      setBgColor(cssColor('--background', '#000000', containerRef.current));
    }, 50);
    return () => clearTimeout(timeout);
  }, [resolvedTheme]);

  if (reduced || !webglSupported) {
    return <div aria-hidden className="absolute inset-0 bg-background" />;
  }

  return (
    <div ref={containerRef} aria-hidden className="absolute inset-0" style={{ pointerEvents: 'none' } as CSSProperties}>
      <Canvas
        camera={{ position: [0, 0, 14], fov: 55 }}
        dpr={[1, 2]}
        resize={{ offsetSize: true }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[bgColor]} />
        <Suspense fallback={null}>
          <EnvironmentGravity color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
}
