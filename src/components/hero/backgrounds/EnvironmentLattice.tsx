'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/env.vert';
import fragmentShader from './shaders/env.frag';

// A full-viewport monochrome 3D point lattice — an "environment" you look
// around in. Strong mouse parallax (group tilt + camera dolly) plus a cursor
// repel in the shader, so movement always feels responsive.
export function EnvironmentLattice({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  const target = useRef(new THREE.Vector2(0, 0));

  // Volumetric grid of points with a little jitter for an organic feel.
  const { positions, offsets, count } = useMemo(() => {
    const cols = 48;
    const rows = 26;
    const layers = 3;
    const pos: number[] = [];
    const off: number[] = [];
    for (let z = 0; z < layers; z++) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = (x / (cols - 1) - 0.5) * 30;
          const py = (y / (rows - 1) - 0.5) * 16;
          const pz = (z / (layers - 1) - 0.5) * 8;
          const j = 0.5;
          pos.push(px + (Math.random() - 0.5) * j, py + (Math.random() - 0.5) * j, pz);
          off.push(Math.random(), Math.random(), Math.random());
        }
      }
    }
    return {
      positions: new Float32Array(pos),
      offsets: new Float32Array(off),
      count: cols * rows * layers,
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 34 },
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

  // Global pointer tracking (canvas itself is non-interactive).
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
      (u.uMouse.value as THREE.Vector2).lerp(target.current, 0.12);
    }

    if (group.current) {
      // Strong tilt toward the cursor — the core "super on mouse move" feel.
      const tx = target.current.x;
      const ty = target.current.y;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, tx * 0.5, 0.06);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -ty * 0.32, 0.06);
      // Slow idle drift so it's alive even without input.
      group.current.rotation.z += delta * 0.01;
    }

    // Camera dolly parallax for depth.
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x * 0.9, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.current.y * 0.6, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
    </group>
  );
}
