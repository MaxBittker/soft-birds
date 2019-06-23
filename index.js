import "file-loader?name=[name].[ext]!./src/html/index.html";
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  DataTexture,
  RGBAFormat,
  FloatType,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector2
} from "three";
import PingpongRenderTarget from "./src/PingpongRenderTarget";
import RenderTarget from "./src/RenderTarget";
import dat from "dat.gui";
import Controls from "./src/Controls";

// 0 configure scene
//////////////////////////////////////

let w = window.innerWidth;
let h = window.innerHeight;

const renderer = new WebGLRenderer({
  alpha: true
});
document.body.appendChild(renderer.domElement);
renderer.setSize(w, h);
const scene = new Scene();
const camera = new OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100);
camera.position.z = 1;

// 1 init buffers
//////////////////////////////////////

let size = 512 / 32; // particles amount = ( size ^ 2 )

let count = size * size;
let pos = new Float32Array(count * 3);
let uvs = new Float32Array(count * 2);
let ptexdata = new Float32Array(count * 4);

let id = 0,
  u,
  v;
for (let i = 0; i < count; i++) {
  //point cloud vertex
  id = i * 3;
  pos[id++] = pos[id++] = pos[id++] = 0;

  //computes the uvs
  u = (i % size) / size;
  v = ~~(i / size) / size;
  id = i * 2;
  uvs[id++] = u;
  uvs[id] = v;

  //particle texture values (agents)
  id = i * 4;
  ptexdata[id++] = Math.random(); // normalized pos x
  ptexdata[id++] = Math.random(); // normalized pos y
  ptexdata[id++] = Math.random(); // normalized angle
  ptexdata[id++] = 1;
}

// 2 data & trails
//////////////////////////////////////

//performs the diffusion and decay
let diffuse_decay = new ShaderMaterial({
  uniforms: {
    points: { value: null },
    decay: { value: 0.9 }
  },
  vertexShader: require("./src/glsl/quad_vs.glsl"),
  fragmentShader: require("./src/glsl/diffuse_decay_fs.glsl")
});
let trails = new PingpongRenderTarget(w, h, diffuse_decay);

// 3 agents
//////////////////////////////////////

//moves agents around
let update_agents = new ShaderMaterial({
  uniforms: {
    data: { value: null },
    sa: { value: 2 },
    ra: { value: 4 },
    so: { value: 12 },
    ss: { value: 1.1 }
  },
  vertexShader: require("./src/glsl/quad_vs.glsl"),
  fragmentShader: require("./src/glsl/update_agents_fs.glsl")
});
let agents = new PingpongRenderTarget(size, size, update_agents, ptexdata);

// 4 point cloud
//////////////////////////////////////

//renders the updated agents as red dots
let render_agents = new ShaderMaterial({
  vertexShader: require("./src/glsl/render_agents_vs.glsl"),
  fragmentShader: require("./src/glsl/render_agents_fs.glsl")
});
let render = new RenderTarget(w, h, render_agents, pos, uvs);

// 5 post process
//////////////////////////////////////

//post process the result of the trails (render the trails as greyscale)
let postprocess = new ShaderMaterial({
  uniforms: {
    data: {
      value: null
    }
  },
  vertexShader: require("./src/glsl/quad_vs.glsl"),
  fragmentShader: require("./src/glsl/postprocess_fs.glsl")
});
let postprocess_mesh = new Mesh(new PlaneBufferGeometry(), postprocess);
postprocess_mesh.scale.set(w, h, 1);
scene.add(postprocess_mesh);

// 6 interactive controls
//////////////////////////////////////
let controls = new Controls(renderer, agents);
controls.count = ~~(size * size * 0.05);

// animation loop
//////////////////////////////////////

//////////////////////////////////////////////////

let materials = [diffuse_decay, update_agents, render_agents];
let resolution = new Vector2(w, h);
materials.forEach(mat => {
  mat.uniforms.resolution.value = resolution;
});

let start = Date.now();
let time = 0;

// settings
//////////////////////////////////////////////////

import { registerMidiUpdateListener, getMidiValue } from "./src/Midi";
import { audioAnalyzer } from "./src/Audio";

let gui = new dat.GUI();

let ss = gui
  .add(update_agents.uniforms.ss, "value", -4, 9, 0.1)
  .name("agent speed");

let values = [
  gui
    .add(diffuse_decay.uniforms.decay, "value", 0.01, 0.999, 0.01)
    .name("decay"),
  gui.add(update_agents.uniforms.sa, "value", 1, 90, 0.1).name("sensor angle"),
  gui
    .add(update_agents.uniforms.ra, "value", 1, 90, 0.1)
    .name("rotation angle"),
  gui.add(update_agents.uniforms.so, "value", 1, 25, 0.1).name("sensor offset"),
  gui.add(controls, "count", 1, size * size, 1)
];

// gui.add(controls, "radius", 0.001, 0.25),
// gui.add(controls, "random");
registerMidiUpdateListener(
  (n, v) => {
    if (!values[n]) {
      return;
    }
    let value = v * values[n].__max;
    //   console.log(values[n]);
    values[n].setValue(value);
  },
  bv => {
    console.log(bv);
    controls.addParticles({ clientX: 500, clientY: 500 });
  }
);

let audioBuffer = null;

let audioVisualization = audio => {
  console.log(audio);

  function raf() {
    requestAnimationFrame(raf);
    time = (Date.now() - start) * 0.001;

    if (!audioBuffer) {
      audioBuffer = new Uint8Array(audio.frequencyBinCount);
    }
    audio.getByteFrequencyData(audioBuffer);
    let bands = new Array(4);
    var f = 0.0;
    var a = 5,
      b = 11,
      c = 24,
      d = 512,
      i = 0;
    for (; i < a; i++) f += audioBuffer[i];
    f *= 0.2; // 1/(a-0)
    f *= 0.003921569; // 1/255
    bands[0] = f;
    f = 0.0;
    for (; i < b; i++) f += audioBuffer[i];
    f *= 0.166666667; // 1/(b-a)
    f *= 0.003921569; // 1/255
    bands[1] = f;
    f = 0.0;
    for (; i < c; i++) f += audioBuffer[i];
    f *= 0.076923077; // 1/(c-b)
    f *= 0.003921569; // 1/255
    bands[2] = f;
    f = 0.0;
    for (; i < d; i++) f += audioBuffer[i];
    f *= 0.00204918; // 1/(d-c)
    f *= 0.003921569; // 1/255
    bands[3] = f;
    let v = bands[3] * 2;
    // v = v * getMidiValue(5) + (getMidiValue(6) - 0.5);

    // ss.setValue(v * 8);

    trails.material.uniforms.points.value = render.texture;
    trails.render(renderer, time);

    agents.material.uniforms.data.value = trails.texture;
    agents.render(renderer, time);

    render.render(renderer, time);

    postprocess_mesh.material.uniforms.data.value = trails.texture;
    renderer.setSize(w, h);
    renderer.clear();
    renderer.render(scene, camera);
  }
  raf();
};

audioAnalyzer({
  done: audioVisualization
});
