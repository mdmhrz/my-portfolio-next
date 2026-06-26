'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/aurora.vert';
import fragmentShader from './shaders/aurora.frag';

// Full-bleed aurora background. Renders a clip-space quad (camera-independent)
// so the fragment shader fills every screen pixel. Mouse position is read from
// a global pointermove listener (the canvas itself is pointer-events:none).
export function Aurora({ base, accent, isDark }: { base: string; accent: string; isDark: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: size.width / size.height || 1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uBase: { value: new THREE.Color(base) },
      uAccent: { value: new THREE.Color(accent) },
      uIsDark: { value: isDark ? 1 : 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const targetMouse = useRef(new THREE.Vector2(0, 0));

  // Keep colors / theme flag live (theme can toggle without remount).
  useEffect(() => {
    uniforms.uBase.value.set(base);
    uniforms.uAccent.value.set(accent);
    uniforms.uIsDark.value = isDark ? 1 : 0;
  }, [base, accent, isDark, uniforms]);

  // Aspect follows viewport size.
  useEffect(() => {
    uniforms.uAspect.value = (size.width / size.height) || 1;
  }, [size, uniforms]);

  // Global pointer tracking (works even though the canvas is non-interactive).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      targetMouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    (u.uMouse.value as THREE.Vector2).lerp(targetMouse.current, 0.04);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
