// Constellation node vertex shader (GLSL as a string).
// Positions drift on the CPU (simple bounded wander); this just renders each
// node as a soft glowing dot, with a boost near the cursor so nodes light up
// as you pass over them.
export default /* glsl */ `
uniform float uSize;
uniform float uPixelRatio;
uniform vec2  uMouse;

varying float vPush;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;

  vPush = smoothstep(0.35, 0.0, length(ndc - uMouse) + 1e-4);

  gl_Position = clip;
  float depthScale = clamp(1.0 - (-mv.z) / 24.0, 0.4, 1.0);
  gl_PointSize = uSize * uPixelRatio * depthScale;
}
`;
