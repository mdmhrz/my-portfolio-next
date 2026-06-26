// Full-background aurora/mesh-gradient fragment shader (GLSL as a string).
// Domain-warped fbm noise produces a calm, slow, premium flowing gradient.
// No bouncy object — this IS the background. The cursor subtly steers the flow.

export default /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uAspect;
uniform vec2  uMouse;   // NDC (-1..1), smoothed
uniform vec3  uBase;    // background tone
uniform vec3  uAccent;  // electric-blue accent
uniform float uIsDark;  // 1.0 dark theme, 0.0 light theme

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise with smooth interpolation.
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uAspect;

  float t = uTime * 0.035;
  vec2 steer = uMouse * 0.6;

  // Two layers of domain warping for soft, organic flow.
  vec2 q = vec2(fbm(p * 0.8 + t + steer), fbm(p * 0.8 + vec2(5.2, 1.3) - t + steer));
  vec2 r = vec2(
    fbm(p + q * 1.6 + vec2(1.7, 9.2) + t * 1.2),
    fbm(p + q * 1.6 + vec2(8.3, 2.8) - t * 1.2)
  );
  float f = fbm(p + r * 1.3);

  vec3 col = uBase;

  // Accent glow follows the warped field.
  float glow = smoothstep(0.25, 0.85, f);
  col = mix(col, uAccent, glow * mix(0.35, 0.55, uIsDark));

  // A second, brighter accent ribbon from the second warp layer.
  float ribbon = smoothstep(0.55, 1.0, length(r) * 0.9);
  col += uAccent * ribbon * mix(0.15, 0.35, uIsDark);

  // Keep the whole thing calm/desaturated so text stays legible.
  col = mix(uBase, col, 0.85);

  // Soft vignette: a touch darker at the edges, keeps focus center-left.
  float vig = smoothstep(1.5, 0.4, length(p));
  col *= mix(0.75, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;
