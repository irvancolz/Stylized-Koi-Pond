import * as THREE from "three";
import { math, } from "../Utils/math";
import Entities from "./ExperienceObject";

const vertexShaderPar = `
  #include <common>

  attribute vec2 aCenter;
  attribute vec3 color;

  uniform float uTime;
  uniform float uElevation;
  uniform sampler2D uGrassHeightTex;
  uniform sampler2D uGrassNormalTex;

  varying vec3 vColor;
  varying vec2 vWorldUv;


  //	Classic Perlin 2D Noise 
  //	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
  //
  vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

  float cnoise(vec2 P){
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * 
      vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
  }

  vec2 getRotatePivot2d(vec2 uv, float rotation, vec2 pivot) {
    return vec2(cos(rotation) * (uv.x - pivot.x) + sin(rotation) * (uv.y - pivot.y) + pivot.x, cos(rotation) * (uv.y - pivot.y) - sin(rotation) * (uv.x - pivot.x) + pivot.y);
  }


`

const vertexShaderMain = `
    #include <project_vertex>
    // vec4 mvPosition = vec4( transformed, 1.0 );
    transformed = position;

    vec2 newCenter = aCenter;
    vec4 worldPos = modelMatrix * vec4(position, 1.);
    worldPos.xz += newCenter;

    float h = texture2D(uGrassHeightTex, uv).r;
    transformed.xyz *= h;
    
    vec4 modelCenter = modelMatrix * vec4(newCenter.x, 0.0, newCenter.y, 1.0);

    transformed.y += uElevation;
    vec4 modelPosition = modelMatrix * vec4(transformed, 1.);
    modelPosition.xz += newCenter;

    float noise = cnoise(uv * 4.);

    float displacement = sin(uTime * .002 + noise * 10.) * color.r;
    displacement *= .12 * h;
    modelPosition.x += displacement;
    modelPosition.z += displacement;

    float angleToCamera = atan(modelCenter.x - cameraPosition.x, modelCenter.z - cameraPosition.z);
    modelPosition.xz = getRotatePivot2d(modelPosition.xz, angleToCamera, modelCenter.xz);

    vec4 modelViewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * modelViewPosition;
    mvPosition = modelViewPosition;
    gl_Position = projectedPosition;


    vColor = color;
    vNormal = texture2D( uGrassNormalTex, uv * 1. ).rgb;
    vWorldUv = uv;

  `

const fragmentShaderPar = `
  #include <common>

  uniform vec3 uColor;
  uniform vec3 uGroundColor;
  uniform sampler2D uGrassHeightTex;

  varying vec3 vColor;
  varying vec2 vWorldUv;

`

const fragmentShaderMain = `
    #include <color_fragment>

    float grassh = texture2D(uGrassHeightTex, vWorldUv).r;
    if(grassh <= 0.2) discard;

    float ci = 1. - vColor.r;
    ci = 1. - pow(ci, 6.);

    vec3 color = mix(uGroundColor, uColor, ci);
    // color = vNormal;

    diffuseColor.rgb = color;

`

export default class Grass extends Entities {
  constructor() {
    super()

    this.density = 150;
    // made it slightly smaller than the world
    this.width = 39;
    this.count = this.density * this.width ** 2;
    this.position = new THREE.Vector3();

    this.rotation = 0;

    this.BLADE_HEIGHT = 0.5;
    this.BLADE_WIDTH = 0.25;
    this.BLADE_HEIGHT_VARIATION = 0.2;

    this.positionsArray = [];
    this.normalsArray = [];
    this.uvsArray = [];
    this.colorsArray = [];
    this.indiciesArray = [];
    this.centersArray = [];

    this.debugConfig = {
      color: "#4a917e",
      ground: "#daba99",
    };

  }


  initMaterial() {
    this.uniforms = {
      uColor: new THREE.Uniform(new THREE.Color(this.debugConfig.color)),
      uGroundColor: new THREE.Uniform(new THREE.Color(this.debugConfig.ground)),
      uTime: new THREE.Uniform(0),
      uElevation: new THREE.Uniform(1.4),
      uGrassHeightTex: new THREE.Uniform(),
      uGrassNormalTex: new THREE.Uniform()
    };
    this.material = new THREE.MeshToonMaterial({
      side: THREE.DoubleSide,
    });
    this.material.onBeforeCompile = shader => {
      shader.uniforms = { ...shader.uniforms, ...this.uniforms }

      shader.vertexShader = shader.vertexShader.replace('#include <common>', vertexShaderPar)
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', vertexShaderMain)

      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', fragmentShaderPar)
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', fragmentShaderMain)
    }
  }

  initGeometry() {
    const VERT_PER_BLADE = 5;
    const SURFACE_MIN = this.width * 0.5 * -1;
    const SURFACE_MAX = this.width * 0.5;

    for (let row = 0; row < this.width; row++) {
      for (let col = 0; col < this.width; col++) {
        for (let idx = 0; idx < this.density; idx++) {
          const i = row * this.width * this.density + col * this.density + idx;
          const rand = math.random(i);

          let x = row - this.width * 0.5 + 0.5 + (rand() - 0.5);
          let y = col - this.width * 0.5 + 0.5 + (rand() - 0.5);

          const center = new THREE.Vector3(x, 0, y).add(this.position);

          const uv = [
            this.convertRange(center.x, SURFACE_MIN, SURFACE_MAX, 0, 1),
            this.convertRange(center.z, SURFACE_MIN, SURFACE_MAX, 0, 1),
          ];

          const blade = this.generateBlade(i * VERT_PER_BLADE, uv);
          blade.verts.forEach((vert) => {
            this.positionsArray.push(...vert.pos);
            this.uvsArray.push(...vert.uv);
            this.colorsArray.push(...vert.color);
            this.normalsArray.push(...vert.normal);
            this.centersArray.push(center.x, center.z);
          });
          blade.indices.forEach((i) => this.indiciesArray.push(i));
        }
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Float32Array(this.positionsArray), 3)
    );

    this.geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(new Float32Array(this.uvsArray), 2)
    );
    this.geometry.setAttribute(
      "cnormal",
      new THREE.Float32BufferAttribute(new Float32Array(this.normalsArray), 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(new Float32Array(this.colorsArray), 3)
    );
    this.geometry.setAttribute(
      "aCenter",
      new THREE.Float32BufferAttribute(new Float32Array(this.centersArray), 2)
    );

    this.geometry.computeVertexNormals();
  }

  init() {
    this.initMaterial()
    this.initGeometry()

    this.uniforms.uGrassHeightTex.value = this.Resources['grass_height']
    this.uniforms.uGrassNormalTex.value = this.Resources['grass_normal']

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;


    this.Graphics.Scene.add(this.mesh);
  }

  registerDebugger() {
    const f = this.Debug.ui.addFolder({
      title: "grass",
      expanded: false,
    });

    f.addBinding(this.debugConfig, "color").on("change", () => {
      this.uniforms.uColor.value.set(this.debugConfig.color);
    });
    f.addBinding(this.debugConfig, "ground").on("change", () => {
      this.uniforms.uGroundColor.value.set(this.debugConfig.ground);
    });

    f.addBinding(this.uniforms.uElevation, "value", {
      min: 0,
      max: 3,
      step: .001,
      label: 'elevation'
    })
    f.addBinding(this, "density", {
      min: 1,
      max: 300,
      step: 1,
    }).on("change", (e) => {
      if (!e.last) return;
      this.reset();
    });
  }

  reset() {
    this.positionsArray = [];
    this.uvsArray = [];
    this.colorsArray = [];
    this.indiciesArray = [];
    this.centersArray = [];
    this.Graphics.Scene.remove(this.mesh);
    this.geometry.dispose();

    this.init()
  }

  update() {
    if (this.States) {

      this.uniforms.uTime.value = this.States.time.elapsed;
    }
  }

  dispose() {
    this.Graphics.Scene.remove(this.mesh);
    this.material.dispose();
    this.geometry.dispose();
  }

  generateBlade(vArrOffset, uv) {
    const rand = math.random(vArrOffset);

    const MID_WIDTH = this.BLADE_WIDTH * 1.75;
    const TIP_OFFSET = 0.1;
    const height = this.BLADE_HEIGHT;

    const yaw = rand() * Math.PI * 2;
    const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
    const tipBend = rand() * Math.PI * 2;
    const tipBendUnitVec = new THREE.Vector3(
      Math.sin(tipBend),
      0,
      -Math.cos(tipBend)
    );

    // Find the Bottom Left, Bottom Right, Top Left, Top right, Top Center vertex positions
    const bl = new THREE.Vector3()
      .copy(yawUnitVec)
      .multiplyScalar((this.BLADE_WIDTH / 2) * 1);

    const br = new THREE.Vector3()
      .copy(yawUnitVec)
      .multiplyScalar((this.BLADE_WIDTH / 2) * -1);

    const tc = new THREE.Vector3()
      .add(tipBendUnitVec)
      .multiplyScalar(TIP_OFFSET);

    tc.y += height;

    // Vertex Colors
    const black = [0, 0, 0];
    const gray = [0.5, 0.5, 0.5];
    const white = [1.0, 1.0, 1.0];

    const verts = [
      { pos: bl.toArray(), uv: uv, color: black, normal: bl.normalize().toArray() },
      { pos: br.toArray(), uv: uv, color: black, normal: br.normalize().toArray() },
      { pos: tc.toArray(), uv: uv, color: white, normal: tc.normalize().toArray() },
    ];

    const indices = [vArrOffset, vArrOffset + 1, vArrOffset + 2];

    return { verts, indices };
  }

  convertRange(val, oldMin, oldMax, newMin, newMax) {
    return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
  }
}
