varying float angle;
void main() {
  float d = (1. - length(.5 - gl_PointCoord.xy)) * 1.;
  gl_FragColor = vec4(d, angle, 0., 1.);
}