import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export default class Graphic {
  constructor(canvas, debug) {

    this.config = {
      uShadowTresshold: new THREE.Uniform(.01),
      uShadowColIntensity: new THREE.Uniform(.5)
    }

    this.$canvas = canvas
    this.debug = debug
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.init()
  }

  _InitScene() {
    this.Scene = new THREE.Scene()
  }

  _InitCamera() {
    this.Camera = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 1, 100)
    this.Camera.position.y = 2
    this.Camera.position.x = 10
    this.Scene.add(this.Camera)

    this.Controls = new OrbitControls(this.Camera, this.$canvas)
    this.Controls.enableDamping = true
  }

  _InitRenderer() {
    this.Renderer = new THREE.WebGLRenderer({ canvas: this.$canvas, antialias: true })
    this.Renderer.toneMapping = THREE.CineonToneMapping;
    this.Renderer.toneMappingExposure = 1.75;
    this.Renderer.shadowMap.enabled = true;
    this.Renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.Renderer.setClearColor("#211d20");
    this.Renderer.setSize(this.sizes.width, this.sizes.height);
    this.Renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

    this.Renderer.render(this.Scene, this.Camera)
  }

  _InitLightning() {
    this.Sun = new THREE.DirectionalLight(0xffffff, 10)
    this.Sun.position.set(1, 1, 1).multiplyScalar(5)
    this.Scene.add(this.Sun)

    this.Ambient = new THREE.AmbientLight(0xffffff, 10)
    // this.Scene.add(this.Ambient)
  }

  initEffects() {
    // here is where i hijack the material
    const custFragParIncl = `
    #include <common>

    uniform float uShadowTresshold;
    uniform float uShadowColIntensity;

    float getLuminance(vec3 color) {
     return dot(color, vec3(0.2126, 0.7152, 0.0722));
    }
    `

    const custFragIncl = `
    #ifdef OPAQUE
      diffuseColor.a = 1.0;
    #endif
    #ifdef USE_TRANSMISSION
      diffuseColor.a *= material.transmissionAlpha;
    #endif

    // inject custom toon shading
    float l = getLuminance(outgoingLight);
   vec3 shadowColor = diffuseColor.rgb * uShadowColIntensity;
   float intensity = step(uShadowTresshold, l);

   outgoingLight = mix(shadowColor * (1. -l), diffuseColor.rgb, intensity);

    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
  `

    this.Scene.traverse(el => {
      if (el.isMesh) {
        el.material.onBeforeCompile = (shader) => {

          shader.uniforms = { ...shader.uniforms, ...this.config }

          shader.fragmentShader = shader.fragmentShader.replace('#include <common>', custFragParIncl)
          shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', custFragIncl)
          //
          console.log(shader.uniforms)
          console.log(shader.fragmentShader)
        }
      }
    })

  }

  init() {
    this._InitScene()
    this._InitCamera()
    this._InitLightning()
    this._InitRenderer()
  }

  registerDebugger() {
    if (!this.debug.active) return

    const f = this.debug.ui.addFolder({ title: 'effects' })
    f.addBinding(this.config.uShadowTresshold, 'value', { min: .01, max: .45, step: .01, label: 'shadow tresshold' })
    f.addBinding(this.config.uShadowColIntensity, 'value', { min: .1, max: .75, step: .01, label: 'shadow intensity' })

  }

  update() {
    this.Renderer.render(this.Scene, this.Camera)
  }

  resize() {
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight

    this.Camera.aspect = this.sizes.width / this.sizes.height
    this.Camera.updateProjectionMatrix()

    this.Renderer.setSize(this.sizes.width, this.sizes.height)
    this.Renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

    this.Renderer.render(this.Scene, this.Camera)
  }

}
