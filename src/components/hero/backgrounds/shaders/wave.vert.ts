// Rolling light-wave vertex shader (GLSL as a string).
// A field of points is displaced into a rolling wave via layered sine motion —
// smooth, GPU-driven (no per-frame CPU vertex loop). Points also carry a
// cursor-proximity "push" value forward to the fragment shader for a glow
// boost, echoing Lattice's cursor-reactive language without relocating points.
export default /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform vec2  uMouse; // pointer in NDC (-1..1), y up

attribute vec3 aOffset; // per-point phase / jitter

varying float vPush;
varying float vHeight;

void main() {
  vec3 pos = position;

  // Layered rolling wave — two offset sine fields for a natural, non-repeating swell.
  float wave = sin(pos.x * 0.26 + uTime * 0.55 + aOffset.x * 6.28) * 0.9
             + cos(pos.z * 0.2 + uTime * 0.4 + aOffset.y * 6.28) * 0.6;
  pos.y += wave;
  vHeight = wave;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;

  // Cursor proximity glow (screen space) — feeds the fragment shader.
  vec2 d = ndc - uMouse;
  float dist = length(d) + 1e-4;
  vPush = smoothstep(0.45, 0.0, dist);

  gl_Position = clip;
  gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z);
}
`;
