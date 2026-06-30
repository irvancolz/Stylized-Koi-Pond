
import * as THREE from "three";
import Entities from "./ExperienceObject";

export default class Koinobori extends Entities {
  constructor(reffs = []) {
    super();

    this._config = {
      enabled: false
    }

    this._reffs = reffs
    this._instances = []

    this._uniforms = {
      uTime: new THREE.Uniform(0),
      uWindPower: new THREE.Uniform(.2),
      uWindSpeed: new THREE.Uniform(.002)
    }

    this._material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide
    })


  }

  init() {
    this._model = this.Resources["koinobori_model"]

    for (let i = 0; i < this._reffs.length; i++) {
      const mesh = this._model.scene.clone()

      const idx = (i % 4) + 1
      const texture = this.Resources['koinobori_0' + idx]

      const mat = this._material.clone()
      mat.onBeforeCompile = shader => {
        shader.uniforms = { ...shader.uniforms, ...this._uniforms }

        shader.vertexShader = shader.vertexShader.replace('#include <common>', `
          #include <common>

          uniform float uTime;
          uniform float uWindPower;
          uniform float uWindSpeed;

          //	Classic Perlin 2D Noise 
          //	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
          //
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
          vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

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


        `)
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
          #include <begin_vertex>

          vec4 modelPosition = modelMatrix * vec4( transformed , 1.);

          float n = cnoise(modelPosition.xz);

          float time = uTime * uWindSpeed;
          float s = uWindPower;

          transformed.x += sin(time) * n * s * abs(transformed.y);
          transformed.z += cos(time) * n * s * abs(transformed.y);


        `)
      }
      mat.map = texture

      mesh.traverse(el => {
        if (el.isMesh) {
          el.material = mat
        }
      })
      mesh.visible = this._config.enabled

      const reff = this._reffs[i]
      mesh.position.copy(new THREE.Vector3(...reff.translation))

      mesh.castShadow = true
      mesh.receiveShadow = true
      this.Graphics.Scene.add(mesh)
      this._instances.push(mesh)
    }



  }

  registerDebugger() {
    const f = this.Debug.ui.addFolder({ 'title': 'carp streamers' })
    f.addBinding(this._config, 'enabled').on('change', () => {
      for (let i = 0; i < this._instances.length; i++) {
        this._instances[i].visible = this._config.enabled
      }
    })

    f.addBinding(this._uniforms.uWindSpeed, 'value', {
      min: .001,
      max: .01,
      step: .001,
      label: 'wind speed'
    })
    f.addBinding(this._uniforms.uWindPower, 'value', {
      min: .001,
      max: .8,
      step: .01,
      label: 'wind power'
    })
  }

  update() {
    if (this.States) {
      const t = this.States.time.elapsed
      this._uniforms.uTime.value = t
    }
  }
}

