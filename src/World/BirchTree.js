import { bushes } from "../Utils/bushes";
import Entities from "./ExperienceObject";
import * as THREE from 'three'

const foliagesVertPar = `
  
  #include <common>

  uniform float uTime;
  //	Classic Perlin 3D Noise 
  //	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
  //
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

  float cnoise(vec3 P){
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }

`
const foliagesVertMain = `
  
  #include <begin_vertex>
  
  vec4 worldPos = modelMatrix * instanceMatrix * vec4(transformed, 1.);
  float noise = cnoise(worldPos.xyz * 2.);

  float time = uTime * .002;
  transformed.xyz += sin(time ) * noise * .5;

`

export class BirchTree extends Entities {
  constructor(reffs) {
    super()
    this._reffs = reffs
    this._foliages = {
      color: '#80ca9a'
    }
    this._stem = {
      color: '#caa27e'
    }
    this._uniforms = {
      uTime: new THREE.Uniform(0)
    }
  }


  _CreateFoliages(sections) {

    this._foliages.material = new THREE.MeshToonMaterial({
      alphaTest: .5,
      transparent: true,
      side: THREE.DoubleSide,
      color: this._foliages.color,
      alphaMap: this.Resources['leaves']
      // wireframe: true,
    })
    this._foliages.material.onBeforeCompile = (shader) => {
      shader.uniforms = { ...shader.uniforms, ...this._uniforms }
      shader.vertexShader = shader.vertexShader.replace('#include <common>', foliagesVertPar)
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', foliagesVertMain)
      shader.fragmentShader = shader.fragmentShader.replace('#include <alphatest_fragment>', `
          #include <alphatest_fragment>

          diffuseColor.a = 1.;
        `)
    }

    this._foliages.geometry = bushes.createGeometry(sections)
    this._foliages.mesh = new THREE.InstancedMesh(this._foliages.geometry, this._foliages.material, this._reffs.length)
    this._foliages.mesh.castShadow = true
    this._foliages.mesh.receiveShadow = true

    this._foliages.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
      alphaTest: .5,
      transparent: true,
      depthPacking: THREE.RGBADepthPacking,
      alphaMap: this.Resources['leaves']
    })
    this._foliages.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = { ...shader.uniforms, ...this._uniforms }
      shader.vertexShader = shader.vertexShader.replace('#include <common>', foliagesVertPar)
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', foliagesVertMain)
    }

    this.Graphics.Scene.add(this._foliages.mesh)

  }

  _CreateStem() {
    this._stem.mesh = new THREE.InstancedMesh(this._stem.geometry, this._stem.material, this._reffs.length);
    this.Graphics.Scene.add(this._stem.mesh)
  }

  init() {

    const foliages = []
    this._mesh = this.Resources['birchtree_model'].scene

    this._mesh.traverse(el => {
      if (el.name.toLowerCase().includes('foliage')) foliages.push(el)
      if (el.isMesh) {
        el.material.color = new THREE.Color(this._stem.color)
        this._stem.geometry = el.geometry
        this._stem.material = el.material
      }
    })

    this._CreateFoliages(foliages)
    this._CreateStem()

    const dummy = new THREE.Object3D()
    for (let i = 0; i < this._reffs.length; i++) {
      dummy.position.copy(new THREE.Vector3(...this._reffs[i].translation))
      dummy.quaternion.copy(new THREE.Quaternion(...this._reffs[i].rotation))
      dummy.scale.copy(new THREE.Vector3(...this._reffs[i].scale))

      dummy.updateMatrix()

      this._stem.mesh.setMatrixAt(i, dummy.matrix)
      this._foliages.mesh.setMatrixAt(i, dummy.matrix)
    }

  }

  registerDebugger() {
    const root = this.Debug.ui.addFolder({ title: 'tree' })

    const stem = root.addFolder({ title: 'stem' })
    stem.addBinding(this._stem, 'color').on('change', () => {
      this._stem.mesh.material.color.set(new THREE.Color(this._stem.color))
    })

    const leaves = root.addFolder({ title: 'leaves' })
    leaves.addBinding(this._foliages.mesh.material, 'depthWrite')
    leaves.addBinding(this._foliages, 'color').on('change', () => {
      this._foliages.mesh.material.color.set(new THREE.Color(this._foliages.color))
    })
  }

  update() {
    if (this.States) {
      this._uniforms.uTime.value = this.States.time.elapsed
    }
  }

  dispose() {
    this.Graphics.Scene.remove(this._stem.mesh)
    this.Graphics.Scene.remove(this._foliages.mesh)
  }
}
