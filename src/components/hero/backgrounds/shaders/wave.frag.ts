// Rolling light-wave fragment shader (GLSL as a string).
// Soft round sprite; wave crests glow brighter than troughs for a shimmering
// field-of-light feel, plus an extra boost near the cursor.
export default /* glsl */ `
precision highp float;

uniform vec3 uColor;
varying float vPush;
varying float vHeight;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.0, d);
  if (alpha < 0.01) discard;
  float crest = smoothstep(-0.6, 1.2, vHeight);
  gl_FragColor = vec4(uColor, alpha * (0.16 + crest * 0.4 + vPush * 0.55));
}
`;
