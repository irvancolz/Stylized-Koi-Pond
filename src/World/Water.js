import * as THREE from 'three'
import Entities from "./ExperienceObject";

export default class Water extends Entities {
  constructor() {
    super()
    const size = 30

    this._uniforms = {
      uTime: new THREE.Uniform(0)
    }

    // non MehsBasicmaterial won't be modified :p
    this._mat = new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: .5
    })
    this._mat.defines = {
      ...this._mat.defines, USE_UV: '', USE_ALPHATEST: ''
    }

    this.depthMat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaTest: 0.5
    });
    this.depthMat.defines = { ...this.depthMat.defines, USE_UV: '' }

    this._geometry = new THREE.PlaneGeometry(size, size)
    this._mesh = new THREE.Mesh(this._geometry, this._mat)
    this._mesh.position.y = .66
    this._mesh.rotateX(-Math.PI * .5)
    this._mesh.castShadow = true
    this._mesh.receiveShadow = true
    this._mesh.customDepthMaterial = this.depthMat

    const onBeforeCompile = shader => {
      shader.uniforms = { ...shader.uniforms, ...this._uniforms }
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
      
    uniform float uTime;

    #include <common>
    float voronoi(vec2 uv) {
        vec2 i = floor(uv);
        vec2 f = fract(uv);
        float minDist1 = 1.0;
        float minDist2 = 1.0;
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec2 neighbor = vec2(float(x), float(y));
                vec2 point = vec2(fract(sin(dot(i + neighbor, vec2(127.1, 311.7))) * 43758.5453));
                vec2 diff = neighbor + point - f;
                float dist = length(diff);
                if (dist < minDist1) {
                    minDist2 = minDist1;
                    minDist1 = dist;
                } else if (dist < minDist2) {
                    minDist2 = dist;
                }
            }
        }
        return minDist2 - minDist1;
    }
            `)

      shader.fragmentShader = shader.fragmentShader.replace(`#include <alphatest_fragment>`, `
    vec2 uv = vUv;
    
    float time = uTime * .001;
    float scale = 8.;
    float distortionStrength = 0.1;
    float distortionFrequency = 5.0;
    float distortionSpeed = 2.0;
    float edgeThresholdMin = 0.02;
    float edgeThresholdMax = 0.05;

    uv *= scale;
    vec2 distortedUV = uv + vec2(
        sin(time * distortionSpeed + uv.y * distortionFrequency) * distortionStrength,
        cos(time * distortionSpeed + uv.x * distortionFrequency) * distortionStrength
    );
    float alpha = voronoi(distortedUV );
    alpha = smoothstep(.05, .02, alpha);
    diffuseColor.a = alpha;

    #include <alphatest_fragment>
            `)
    }

    this._mesh.material.onBeforeCompile = onBeforeCompile
    this._mesh.customDepthMaterial.onBeforeCompile = onBeforeCompile
  }

  init() {
    this.Graphics.Scene.add(this._mesh)
  }

  update() {
    if (this.States) {
      this._uniforms.uTime.value = this.States.time.elapsed
    }
    if (this.Graphics) {
      this._mesh.position.y = this.Graphics._water.uWaterHeight.value
    }
  }
}
