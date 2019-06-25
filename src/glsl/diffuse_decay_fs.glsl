
uniform sampler2D points;
uniform sampler2D input_texture;
uniform vec2 resolution;
uniform float time;
uniform float decay;
varying vec2 vUv;

const float PI = 3.14159265358979323846264; // PI
const float PI2 = PI * 2.;
const float RAD = 1. / PI;

void main() {

  vec2 res = 1. / resolution;
  float pos = texture2D(points, vUv).r;
  float posA = texture2D(points, vUv).g;

  float posAcc = 0.;

  // blur box size
  const float dim = 1.;

  // weight
  float weight = 1. / pow(2. * dim + 1., 2.);

  float weightAcc = 0.;
  for (float i = -dim; i <= dim; i++) {

    for (float j = -dim; j <= dim; j++) {

      vec4 val = texture2D(input_texture, fract(vUv + res * vec2(i, j))).rgba;
      posAcc += val.r * weight + val.g * weight;

      float angleWeight = max(val.g, val.r);
      weightAcc += angleWeight;
    }
  }

  // angle accumulator
  vec2 aAcc = vec2(0.);
  for (float i = -dim; i <= dim; i++) {
    for (float j = -dim; j <= dim; j++) {
      vec4 val = texture2D(input_texture, fract(vUv + res * vec2(i, j))).rgba;

      float current_angle = val.b * PI2;
      float angle = (val.a) * PI2;

      vec2 current = vec2(cos(current_angle), sin(current_angle));
      vec2 heading = vec2(cos(angle), sin(angle));
      float angleWeight = max(val.g, val.r) / weightAcc;

      aAcc += (current * angleWeight) + (heading * angleWeight);
    }
  }

  float accumulatedAngle = (atan(aAcc.y, aAcc.x) / PI2) * 2.0;

  vec4 final = vec4(pos * decay, posAcc * decay, posA, accumulatedAngle);
  gl_FragColor = final;
  // gl_FragColor = clamp(final, 0.0, 1.);
}