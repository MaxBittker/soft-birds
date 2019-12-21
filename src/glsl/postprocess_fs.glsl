
uniform sampler2D data;
uniform sampler2D agent_render;
uniform sampler2D agent_data;

uniform float separation;
uniform float cohesion;
varying vec2 vUv;

// clang-format off
#pragma glslify: hsv2rgb = require('glsl-hsv2rgb')
// #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
// #pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
// #pragma glslify: random = require(glsl-random)

// clang-format on

const float PI = 3.14159265358979323846264; // PI
const float PI2 = PI * 2.;
const float RAD = 1. / PI;

float debug = 0.8;
// vec3 hsv2rgb(vec3 c) {
//   vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
//   vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
//   return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
// }

void main() {
  vec2 pos = vUv / 1.;
  // vec4 protag = texture2D(data, vec2(1. / 50.));
  // pos += (protag.xy);

  if (pos.x < 0.35 && pos.y > 1.0 - 0.35) {
    // pos.x -= (protag.x);
    // pos.y += protag.y / 2.;
    // pos.y += protag.y / 2.;
    // pos /= 4.;
    // pos.x += protag.x / 2.0;
  }
  pos = mod(pos, 1.0);
  vec4 src = texture2D(data, pos);

  float density = src.g;
  // float angle = src.a * PI2;
  // vec2 heading = vec2(cos(angle), sin(angle));

  // angle with trail density

  // if (pos.x > 0.9 * debug) {

  vec4 agent_src = texture2D(agent_render, pos);
  vec3 rainbow;

  // // plain render
  // rainbow = hsv2rgb(vec3(agent_src.g, 0.9, agent_src.r));

  // gl_FragColor = vec4(rainbow, 1.0);

  // } else
  // if (pos.y > 0.9 * debug) {
  // density
  // gl_FragColor = vec4(src.ggg * 1., 1.0);
  // } else if (pos.y < 0.1) {
  rainbow = hsv2rgb(vec3(src.a, 0.5 + agent_src.r * 0.2 + density * 0.01,
                         clamp(density, 0., 5.) * 0.08 + agent_src.r * 0.9));
  if (density > 0.9) {

    rainbow =
        hsv2rgb(vec3(agent_src.z, 0.2 + agent_src.r * 0.2 + density * 0.01,
                     clamp(density, 0., 5.) * 0.08 + agent_src.r * 0.9));
  }

  // vec3 c = vec3(rainbow);
  // rainbow = hsv2rgb(vUv.x * 255., 255.0, 50.);

  if (density > separation) {
    // rainbow += vec3(0.05, 0., 0.);
  }
  if (density < cohesion) {
    // rainbow +=
    // vec3(0.0, 0.1, 0.) * clamp(1. - (cohesion - density) * 5., 0.1, 1.);
  }
  if (vUv.x < 0.3 && vUv.y < 0.6) {
    // rainbow = hsv2rgb(vec3(src.a, 0.1, 0.4 + agent_src.r));
    // rainbow = hsv2rgb(vec3(agent_src.z / 1.0, 0.9, 0.4 + agent_src.r));
    // rainbow = agent_src.xzz * 10.0;
  }
  gl_FragColor = vec4(rainbow, 1.0);

  // vec2 square = abs(vUv - vec2(0.5)); // Similar to ( Y greater than 0.1 )
  // vec3 color = vec3(1.0) * step(0.4, max(square.x, square.y));
  // gl_FragColor = vec4(color, 1.0);

  // gl_FragColor = vec4(c * src.g * 4., 1.);

  // }
}