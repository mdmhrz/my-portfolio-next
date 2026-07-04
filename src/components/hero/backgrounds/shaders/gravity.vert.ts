// Gravity-well vertex shader (GLSL as a string).
// Positions are updated on the CPU each frame (real velocity/attraction
// physics needs persistent per-particle state, which is far simpler to keep
// in JS arrays than a GPGPU ping-pong setup). This shader just renders the
// resulting points: faster-moving particles glow brighter/bigger, like a
// comet trail, and everything gets an extra boost near the cursor.
export default /* glsl */ `
uniform float uSize;
uniform float uPixelRatio;
uniform vec2  uMouse;

attribute float aSpeed; // per-particle current speed, updated on the CPU each frame

varying float vSpeed;
varying float vPush;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;

  vec2 d = ndc - uMouse;
  vPush = smoothstep(0.45, 0.0, length(d) + 1e-4);
  vSpeed = clamp(aSpeed, 0.0, 1.0);

  gl_Position = clip;
  float depthScale = clamp(1.0 - (-mv.z) / 26.0, 0.3, 1.0);
  gl_PointSize = uSize * uPixelRatio * (0.55 + vSpeed * 0.9) * depthScale;
}
`;
