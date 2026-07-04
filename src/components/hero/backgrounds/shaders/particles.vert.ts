// Drifting dust vertex shader (GLSL as a string).
// Vertical drift and horizontal sway are computed entirely on the GPU (wrapped
// via mod() so it loops seamlessly) — no per-frame CPU vertex loop. Depth-based
// size falloff (near bigger/brighter, far smaller/dimmer) plus per-particle
// size variance and twinkle phase for an organic, non-uniform field.
export default /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform vec2  uMouse;

attribute float aSpeed;
attribute vec3  aOffset; // x: sway phase, y: size/twinkle-speed variance, z: twinkle phase

varying float vTwinkle;
varying float vPush;

void main() {
  vec3 pos = position;

  float range = 18.0;
  pos.y = mod(pos.y + uTime * aSpeed + range * 0.5, range) - range * 0.5;
  pos.x += sin(uTime * 0.3 + aOffset.x * 6.28) * 0.4;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;

  vec2 d = ndc - uMouse;
  float dist = length(d) + 1e-4;
  vPush = smoothstep(0.4, 0.0, dist);

  vTwinkle = 0.5 + 0.5 * sin(uTime * (0.6 + aOffset.y * 0.8) + aOffset.z * 6.28);

  gl_Position = clip;
  float depthScale = clamp(1.0 - (-mv.z) / 20.0, 0.35, 1.0);
  gl_PointSize = uSize * uPixelRatio * (0.6 + aOffset.y * 0.8) * depthScale;
}
`;
