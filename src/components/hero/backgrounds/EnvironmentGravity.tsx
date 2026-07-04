'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/gravity.vert';
import fragmentShader from './shaders/gravity.frag';

const COUNT = 550;
const MAX_RANGE = 16;
const RESPAWN_RADIUS = 9;

// A swarm of particles orbiting a gravity well that follows the cursor — real
// attraction + tangential "orbit" force (not just particles snapping to a
// point), so it swirls like a tiny galaxy instead of collapsing into a dot.
// Particles that drift too far are respawned on a shell around the well so
// the swarm density stays constant forever.
export function EnvironmentGravity({ color }: { color: string }) {
  const points = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const well = useRef(new THREE.Vector3(0, 0, 0));

  const { positions, velocities, speeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = RESPAWN_RADIUS * (0.4 + Math.random() * 0.6);
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(theta) * r * 0.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      // Small initial tangential kick so it's already swirling on load.
      vel[i * 3] = -Math.sin(theta) * 0.6;
      vel[i * 3 + 1] = Math.cos(theta) * 0.6;
      vel[i * 3 + 2] = 0;
      spd[i] = 0;
    }
    return { positions: pos, velocities: vel, speeds: spd };
  }, []);

  const uniforms = useMemo(
    () => ({
      uSize: { value: 28 },
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
      mouseTarget.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30); // clamp so tab-switch stalls don't fling particles
    const u = matRef.current?.uniforms;
    if (u) (u.uMouse.value as THREE.Vector2).lerp(mouseTarget.current, 0.1);

    // The well drifts toward the cursor rather than snapping — gives the
    // whole swarm a lagging, fluid feel as you move.
    well.current.x = THREE.MathUtils.lerp(well.current.x, mouseTarget.current.x * 7, 0.05);
    well.current.y = THREE.MathUtils.lerp(well.current.y, mouseTarget.current.y * 4.5, 0.05);

    const geom = points.current?.geometry;
    const posAttr = geom?.attributes.position as THREE.BufferAttribute | undefined;
    const speedAttr = geom?.attributes.aSpeed as THREE.BufferAttribute | undefined;
    if (!posAttr || !speedAttr) return;

    const G = 5.5;
    const ORBIT = 3.2;
    const DAMPING = 0.985;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      const pz = posAttr.getZ(i);

      const dx = well.current.x - px;
      const dy = well.current.y - py;
      const dz = well.current.z - pz;
      const distSq = dx * dx + dy * dy + dz * dz;
      const dist = Math.sqrt(distSq);

      if (dist > MAX_RANGE) {
        // Respawn on a shell around the well with a fresh tangential kick.
        const theta = Math.random() * Math.PI * 2;
        const r = RESPAWN_RADIUS * (0.4 + Math.random() * 0.6);
        posAttr.setXYZ(i, well.current.x + Math.cos(theta) * r, well.current.y + Math.sin(theta) * r * 0.6, (Math.random() - 0.5) * 6);
        velocities[ix] = -Math.sin(theta) * 0.6;
        velocities[ix + 1] = Math.cos(theta) * 0.6;
        velocities[ix + 2] = 0;
        continue;
      }

      const softenedDistSq = distSq + 1.2;
      const forceMag = Math.min(G / softenedDistSq, 4);
      const invDist = 1 / (dist + 0.0001);
      const rx = dx * invDist;
      const ry = dy * invDist;
      const rz = dz * invDist;

      // Tangential vector (perpendicular to radial, in-plane swirl).
      const tx = ry;
      const ty = -rx;

      const orbitScale = (ORBIT * invDist) * 2;

      velocities[ix] = (velocities[ix] + (rx * forceMag + tx * orbitScale) * dt) * DAMPING;
      velocities[ix + 1] = (velocities[ix + 1] + (ry * forceMag + ty * orbitScale) * dt) * DAMPING;
      velocities[ix + 2] = (velocities[ix + 2] + rz * forceMag * dt) * DAMPING;

      const vx = velocities[ix];
      const vy = velocities[ix + 1];
      const vz = velocities[ix + 2];

      posAttr.setXYZ(i, px + vx * dt, py + vy * dt, pz + vz * dt);
      speedAttr.setX(i, Math.sqrt(vx * vx + vy * vy + vz * vz) / 4);
    }
    posAttr.needsUpdate = true;
    speedAttr.needsUpdate = true;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseTarget.current.x * 0.4, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseTarget.current.y * 0.3, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
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
