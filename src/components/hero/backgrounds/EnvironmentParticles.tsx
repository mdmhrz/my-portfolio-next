'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// A drifting field of soft glowing dust — slow continuous vertical drift with
// depth (near particles bigger/brighter), plus gentle mouse parallax. Visually
// distinct from the Lattice's structured grid + cursor-repel behavior: this is
// ambient and atmospheric rather than reactive/architectural.
export function EnvironmentParticles({ color }: { color: string }) {
  const points = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const target = useRef(new THREE.Vector2(0, 0));

  const { positions, speeds, count } = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14; // z (depth)
      spd[i] = 0.15 + Math.random() * 0.35;
    }
    return { positions: pos, speeds: spd, count };
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: 0.09,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    material.color.set(color);
  }, [color, material]);

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
    const geom = points.current?.geometry;
    const posAttr = geom?.attributes.position as THREE.BufferAttribute | undefined;
    if (posAttr) {
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i) + speeds[i] * delta;
        if (y > 9) y = -9; // wrap back to the bottom once it drifts off the top
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // Gentle parallax — subtler than Lattice's strong tilt, matching the ambient feel.
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x * 0.6, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.current.y * 0.4, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={points} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  );
}
