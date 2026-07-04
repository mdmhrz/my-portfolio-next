// Drifting dust fragment shader (GLSL as a string).
// Soft round glow, each particle gently pulsing (twinkle), with an extra
// brightness boost near the cursor.
export default /* glsl */ `
precision highp float;

uniform vec3 uColor;
varying float vTwinkle;
varying float vPush;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.0, d);
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uColor, alpha * (0.15 + vTwinkle * 0.35 + vPush * 0.5));
}
`;
