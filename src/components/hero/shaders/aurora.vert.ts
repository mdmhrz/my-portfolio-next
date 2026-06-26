// Fullscreen quad vertex shader — ignores the camera entirely and fills clip
// space, so the fragment shader runs once per screen pixel regardless of scene.
export default /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
