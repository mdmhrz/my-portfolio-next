'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/wave.vert';
import fragmentShader from './shaders/wave.frag';

// A rolling field of glowing light-points, viewed from an elevated angle
// like a horizon — wave crests shimmer brighter, and the whole field glows
// near the cursor. Structurally distinct from Lattice (a volumetric grid you
// sit inside, cursor-repel) and Particles (soft floating depth dust,
// vertical drift): this one has directional flow and a horizon composition.
export function EnvironmentWave({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera, viewport } = useThree();
  const target = useRef(new THREE.Vector2(0, 0));

  // Horizontal extent scales with the actual canvas viewport (in world units
  // at z=0) so the floor always reaches the left/right edges, at any aspect ratio.
  const { positions, offsets } = useMemo(() => {
    const cols = 90;
    const rows = 50;
    const spreadX = viewport.width * 1.5;
    const pos: number[] = [];
    const off: number[] = [];
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        const px = (x / (cols - 1) - 0.5) * spreadX;
        const pz = (z / (rows - 1)) * -30 - 2; // recedes away from the camera
        pos.push(px, 0, pz);
        off.push(Math.random(), Math.random(), Math.random());
      }
    }
    return { positions: new Float32Array(pos), offsets: new Float32Array(off) };
  }, [viewport.width]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 30 },
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

    // Gentle horizon sway + subtle camera parallax — calmer than Lattice's strong tilt.
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.current.x * 0.12, 0.04);
    }
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x * 0.5, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.4 + target.current.y * 0.4, 0.03);
    camera.lookAt(0, -1, -10);
  });

  return (
    <group ref={group} position={[0, -2.5, 0]}>
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
