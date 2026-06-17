import * as THREE from 'three'
import Entities from "./ExperienceObject";

export default class Water extends Entities {
  constructor() {
    super()
    const size = 20

    this._uniforms = {
      uTime: new THREE.Uniform(0)
    }

    const _vertexShader = `
    varying vec2 vUv;

    void main(){
    vUv = uv;

    gl_Position =  projectionMatrix * modelViewMatrix * vec4(position, 1.);
    }

    `

    const _fragmentShader = `
    uniform float uTime;
   
   varying vec2 vUv;
    
    // Simplex 2D noise
    //
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }


    void main(){
      vec2 uv = vUv;
      float time = uTime * .0001;
    
      vec3 color = vec3(1.);
      float alpha = 1.;
      float r = distance(uv, vec2(.5));
      r *= 2.;

      float d = r;
      d = 1. - d;
      d += time;

      float noise = snoise(uv * 8.);

       d *= 4.;
      d = mod(d, 1.);
      d = smoothstep(.5, 1., d);

      // d *= r;
      d *= noise;

      alpha = d;
      color = vec3(d);

      if(alpha <= 0.) 
        discard;

      gl_FragColor =  vec4(color, alpha);
    }

    `
    this._mat = new THREE.ShaderMaterial({
      transparent: true,
      fragmentShader: _fragmentShader,
      uniforms: this._uniforms,
      vertexShader: _vertexShader
    })

    this._geometry = new THREE.PlaneGeometry(size, size)
    this._mesh = new THREE.Mesh(this._geometry, this._mat)
    this._mesh.rotateX(-Math.PI * .5)
  }

  init() {
    this.Graphics.Scene.add(this._mesh)
  }

  update() {
    if (this.States) {
      this._uniforms.uTime.value = this.States.time.elapsed
    }
  }
}
