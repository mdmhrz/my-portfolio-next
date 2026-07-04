'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/particles.vert';
import fragmentShader from './shaders/particles.frag';

// A drifting field of soft glowing, twinkling dust — vertical drift + gentle
// sway computed entirely on the GPU, depth-based size falloff, and a cursor
// glow boost. Visually distinct from Lattice (rigid grid, cursor-repel) and
// Wave (directional rolling horizon): this one is ambient and atmospheric.
export function EnvironmentParticles({ color }: { color: string }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const target = useRef(new THREE.Vector2(0, 0));

  const { positions, speeds, offsets } = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const off = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      spd[i] = 0.15 + Math.random() * 0.35;
      off[i * 3] = Math.random();
      off[i * 3 + 1] = Math.random();
      off[i * 3 + 2] = Math.random();
    }
    return { positions: pos, speeds: spd, offsets: off };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uColor.value.set(color);
  }, [color, uniforms]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const u = matRef.current?.uniforms;
    if (u) {
      u.uTime.value += delta;
      (u.uMouse.value as THREE.Vector2).lerp(target.current, 0.1);
    }

    // Gentle parallax — subtler than Lattice's strong tilt, matching the ambient feel.
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x * 0.6, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.current.y * 0.4, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset" args={[offsets, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
