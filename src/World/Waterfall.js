import * as THREE from 'three'
import Entities from "./ExperienceObject";
import { math } from '../Utils/math';

const fragmentParIncl = `
      
    uniform float uTime;
    uniform float uSpeed;

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
`

const fragmentMainIncl = `
    vec2 uv = vUv;
    
    float time = uTime * .001 * uSpeed;
    float scale = 6.;
    float distortionStrength = 0.1;
    float distortionFrequency = 5.0;
    float distortionSpeed = 2.0;
    float edgeThresholdMin = 0.02;
    float edgeThresholdMax = 0.05;

    uv.y -= time * .1;
    uv *= scale;
    vec2 distortedUV = uv + vec2(
        sin(time * distortionSpeed + uv.y * distortionFrequency) * distortionStrength,
        cos(time * distortionSpeed + uv.x * distortionFrequency) * distortionStrength
    );
    float alpha = voronoi(distortedUV );
    alpha = smoothstep(.05, .02, alpha);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.), alpha);

    #include <alphatest_fragment>
`
const pointVertShader = `
    attribute float aDelay;

    uniform float uTime;
    uniform float uSpeed;


    float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
    {
        return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
    }

    void main(){
      float time = uTime * .0003 * uSpeed + aDelay;
      vec3 transformed = position;

      float progress =  mod(time, 1.);
      float scale =  1.;
      
      float growProgress = smoothstep(.1, .3, progress);
      scale *= growProgress;
      
      float shrinkProgress = smoothstep(.5, 1., progress);
      scale *= 1. - shrinkProgress;

      transformed.y += progress;

      vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      gl_Position = projectionMatrix * viewPosition;
      gl_PointSize = 500.0 * scale; 
      gl_PointSize *= 1.0 / - viewPosition.z;
    }
`

const pointFragShader = `
    void main(){
      float alpha = 1. - distance(vec2(.5), gl_PointCoord);
      if(alpha < .5) discard;

      gl_FragColor = vec4(1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
`
export default class Waterfall extends Entities {
  constructor() {
    super()

    this._bubblePosition = new THREE.Vector3()

    this._uniforms = {
      uTime: new THREE.Uniform(0),
      uSpeed: new THREE.Uniform(1)
    }

    this._material = new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide
    })
    this._material.defines = { ...this._material.defines, USE_UV: '' }

    const onBeforeCompile = shader => {
      shader.uniforms = { ...shader.uniforms, ...this._uniforms }
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', fragmentParIncl)
      shader.fragmentShader = shader.fragmentShader.replace(`#include <alphatest_fragment>`, fragmentMainIncl)
    }

    this._material.onBeforeCompile = onBeforeCompile


    this._bubbles = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: pointVertShader,
      fragmentShader: pointFragShader
    }))
  }

  init() {
    this._material.color = this.Graphics._water.uWaterColor.value
    this._model = this.Resources['waterfall_model']

    this._model.scene.traverse(el => {
      if (el.name.toLowerCase().includes('bubble')) el.getWorldPosition(this._bubblePosition)
      if (el.isMesh) {
        el.material = this._material
        el.receiveShadow = true
        el.castShadow = true
      }
    })

    const COUNT = 200
    const positionArray = new Float32Array(COUNT * 3)
    const delayArray = new Float32Array(COUNT)
    const scaleArray = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3

      const r = math.random(i)
      const x = (r() - .5) * 2
      const y = (r() - .5) * 2
      const z = (r() - .5) * .5
      positionArray[i3 + 0] = x
      positionArray[i3 + 1] = y
      positionArray[i3 + 2] = z

      const delay = r() - .5
      delayArray[i] = delay * 2

      const scale = r()
      scaleArray[i] = scale
    }

    this._bubbles.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    this._bubbles.geometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))
    this._bubbles.geometry.setAttribute('aDelay', new THREE.BufferAttribute(delayArray, 1))
    this._bubbles.position.copy(this._bubblePosition)

    this.Graphics.Scene.add(this._model.scene)
    this.Graphics.Scene.add(this._bubbles)
  }

  registerDebugger() {
    const d = this.Debug.ui.addFolder({ title: 'waterfall / river' })
    d.addBinding(this._uniforms.uSpeed, 'value', { min: .1, max: 8, step: .1, label: 'speed' })
  }

  update() {
    if (this.States) {
      this._uniforms.uTime.value = this.States.time.elapsed
    }
  }
}
