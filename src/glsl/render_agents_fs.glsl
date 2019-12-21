varying float angle;
varying float species;

void main() {
  float d = (1. - length(.5 - gl_PointCoord.xy)) * 1.;
  gl_FragColor = vec4(d, angle, floor(species * 10.0) / 10.0, 1.);
}