uniform sampler2D agents;
varying float angle;
void main() {
  vec3 uva = texture2D(agents, uv).xyz;
  gl_Position = vec4(uva.xy * 2.0 - 1., 0., 1.);
  gl_PointSize = 1.0;
  angle = uva.z;
}