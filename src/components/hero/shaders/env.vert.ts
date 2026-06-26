// B&W 3D point-grid vertex shader (GLSL as a string).
// Idle: a gentle sine wave so the lattice is always alive. Interaction: points
// near the cursor in SCREEN space are pushed radially outward (a visible repel).
export default /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform vec2  uMouse; // pointer in NDC (-1..1), y up

attribute vec3 aOffset; // per-point phase / jitter

varying float vPush;

void main() {
  vec3 pos = position;

  // Idle life: slow wave across the lattice.
  pos.y += sin(pos.x * 0.3 + uTime * 0.6 + aOffset.x * 6.28) * 0.35;
  pos.x += cos(pos.z * 0.25 + uTime * 0.45 + aOffset.y * 6.28) * 0.25;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;

  // Repel from the cursor in screen space.
  vec2 d = ndc - uMouse;
  float dist = length(d) + 1e-4;
  float push = smoothstep(0.4, 0.0, dist);
  vec2 dir = d / dist;
  pos.xy += dir * push * 0.8;
  vPush = push;

  mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z);
}
`;
