'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/constellation.vert';
import fragmentShader from './shaders/constellation.frag';

const COUNT = 85;
const LINK_DISTANCE = 4.2;
const MAX_LINE_VERTICES = 900 * 2; // generous cap; excess pairs in a frame are simply skipped

// A network of nodes drifting slowly in a bounded volume, connected by lines
// whenever two nodes are close enough — connections form and dissolve as
// nodes drift, like a living neural net. Distinct from every other
// background here: this one is about relationships between points, not the
// points themselves.
export function EnvironmentConstellation({ color }: { color: string }) {
  const nodesRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const nodeMatRef = useRef<THREE.ShaderMaterial>(null);
  const { camera, viewport } = useThree();
  const target = useRef(new THREE.Vector2(0, 0));

  // The node volume scales with the actual canvas viewport so the network
  // always occupies a consistent fraction of the frame, at any aspect ratio,
  // instead of a fixed world-space box.
  const bounds = useMemo(
    () => ({
      x: Math.max(6, viewport.width * 0.55),
      y: Math.max(4, viewport.height * 0.55),
      z: 4,
    }),
    [viewport.width, viewport.height],
  );

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2 * bounds.x;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2 * bounds.y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2 * bounds.z;
      vel[i * 3] = (Math.random() - 0.5) * 0.5;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return { positions: pos, velocities: vel };
  }, [bounds]);

  const linePositions = useMemo(() => new Float32Array(MAX_LINE_VERTICES * 3), []);
  const lineColors = useMemo(() => new Float32Array(MAX_LINE_VERTICES * 3), []);

  const nodeUniforms = useMemo(
    () => ({
      uSize: { value: 22 },
      uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    nodeUniforms.uColor.value.set(color);
  }, [color, nodeUniforms]);

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

  const colorVec = useMemo(() => new THREE.Color(), []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const nu = nodeMatRef.current?.uniforms;
    if (nu) (nu.uMouse.value as THREE.Vector2).lerp(target.current, 0.08);

    const geom = nodesRef.current?.geometry;
    const posAttr = geom?.attributes.position as THREE.BufferAttribute | undefined;
    if (!posAttr) return;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      let x = posAttr.getX(i) + velocities[ix] * dt;
      let y = posAttr.getY(i) + velocities[ix + 1] * dt;
      let z = posAttr.getZ(i) + velocities[ix + 2] * dt;

      if (x > bounds.x || x < -bounds.x) velocities[ix] *= -1;
      if (y > bounds.y || y < -bounds.y) velocities[ix + 1] *= -1;
      if (z > bounds.z || z < -bounds.z) velocities[ix + 2] *= -1;

      x = THREE.MathUtils.clamp(x, -bounds.x, bounds.x);
      y = THREE.MathUtils.clamp(y, -bounds.y, bounds.y);
      z = THREE.MathUtils.clamp(z, -bounds.z, bounds.z);

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;

    // Rebuild the connection lines from current node positions.
    let vertexCount = 0;
    outer: for (let i = 0; i < COUNT; i++) {
      const ax = posAttr.getX(i);
      const ay = posAttr.getY(i);
      const az = posAttr.getZ(i);
      for (let j = i + 1; j < COUNT; j++) {
        const bx = posAttr.getX(j);
        const by = posAttr.getY(j);
        const bz = posAttr.getZ(j);
        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < LINK_DISTANCE) {
          if (vertexCount + 2 > MAX_LINE_VERTICES) break outer;
          const closeness = 1 - dist / LINK_DISTANCE;
          colorVec.set(color).multiplyScalar(closeness);

          const vi = vertexCount * 3;
          linePositions[vi] = ax;
          linePositions[vi + 1] = ay;
          linePositions[vi + 2] = az;
          linePositions[vi + 3] = bx;
          linePositions[vi + 4] = by;
          linePositions[vi + 5] = bz;

          lineColors[vi] = colorVec.r;
          lineColors[vi + 1] = colorVec.g;
          lineColors[vi + 2] = colorVec.b;
          lineColors[vi + 3] = colorVec.r;
          lineColors[vi + 4] = colorVec.g;
          lineColors[vi + 5] = colorVec.b;

          vertexCount += 2;
        }
      }
    }

    const lineGeom = linesRef.current?.geometry;
    if (lineGeom) {
      (lineGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeom.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      lineGeom.setDrawRange(0, vertexCount);
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x * 0.5, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.current.y * 0.35, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={nodeMatRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} material={lineMaterial}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
      </lineSegments>
    </>
  );
}
