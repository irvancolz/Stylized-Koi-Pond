import * as THREE from 'three'
import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js'

export default class Graphic {
  constructor(canvas, debug) {

    this._sun = {
      intensity: 1.4
    }

    this._water = {
      uWaterHeight: new THREE.Uniform(.66),
      uWaterColor: new THREE.Uniform(new THREE.Color('#17cf9f')),
      uFoamWidth: new THREE.Uniform(.03)
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
    this.Camera.position.y = 30
    // this.Camera.position.x = 10
    this.Scene.add(this.Camera)

    this.Controls = new OrbitControls(this.Camera, this.$canvas)
    this.Controls.enableDamping = true
    this.Controls.minPolarAngle = Math.PI * 0.25;
    this.Controls.maxPolarAngle = Math.PI * 0.45;
    this.Controls.maxDistance = 80 * 0.4;
    this.Controls.minDistance = 1;
  }

  _InitRenderer() {
    this.Renderer = new THREE.WebGLRenderer({ canvas: this.$canvas, antialias: true })
    this.Renderer.toneMapping = THREE.CineonToneMapping;
    this.Renderer.toneMappingExposure = 1.75;
    this.Renderer.shadowMap.enabled = true;
    this.Renderer.shadowMap.type = THREE.PCFShadowMap;
    this.Renderer.setClearColor("#211d20");
    this.Renderer.setSize(this.sizes.width, this.sizes.height);
    this.Renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

    this.Renderer.render(this.Scene, this.Camera)
  }

  _InitLightning() {
    this.Sun = new THREE.DirectionalLight(0xffffff, this._sun.intensity)
    this.Sun.position.set(.5, 1, 0.3).multiplyScalar(10)
    this.Sun.shadow.camera.top = 20;
    this.Sun.shadow.camera.bottom = -20;
    this.Sun.shadow.camera.right = 20;
    this.Sun.shadow.camera.left = -20;
    this.Sun.shadow.camera.far = 20;
    this.Sun.shadow.camera.near = 1;
    this.Sun.shadow.mapSize.set(2048, 2048);
    this.Sun.shadow.bias = -0.01;
    this.Sun.shadow.radius = 2;
    this.Sun.castShadow = true;
    this.Scene.add(this.Sun)

    const _ShadowHelper = new THREE.CameraHelper(this.Sun.shadow.camera)
    // this.Scene.add(_ShadowHelper)

    this.Ambient = new THREE.AmbientLight(0xffffff, 1)
    this.Scene.add(this.Ambient)
  }

  initEffects() {
    // here is where i hijack the material
    const custVertParIncl = `
    #include <common>

    varying vec3 vWorldPosition;
    `

    const custVertIncl = `
    #include <fog_vertex>
  
    vWorldPosition = worldPosition.xyz;
  `
    const custFragParIncl = `
    #include <common>

    uniform float uWaterHeight;
    uniform vec3 uWaterColor;
    uniform float uFoamWidth;

    varying vec3 vWorldPosition;

    float plot(float st, float pct){
      return  smoothstep( pct-uFoamWidth, pct, st) -
              smoothstep( pct, pct+uFoamWidth,  st);
    }

    `

    const custFragIncl = `
    #include <color_fragment>
   
    float y = vWorldPosition.y;
    float h = y - uWaterHeight;
    h = smoothstep(-.015, 0., h);
    vec3 c = mix(uWaterColor, diffuseColor.rgb, h);

    float ft = .2;
    vec3 foamCol = vec3(1.);
    float fh = plot(y, uWaterHeight);
    c = mix(c, foamCol, fh);
    
    #if  defined(IS_FISH)
      diffuseColor.rgb = diffuseColor.rgb;
    #else
      diffuseColor.rgb = c;
    #endif
  `

    const swapToMeshToonMaterial = (el) => {
      if (!el.isMesh) return
      if (!el.material.isMeshStandardMaterial) return
      el.material = new THREE.MeshToonMaterial({
        map: el.material.map,
        color: el.material.color,
        side: THREE.DoubleSide
      })

      el.material.defines = {
        ...el.material.defines,
      }

      if (el.isFish) el.material.defines.IS_FISH = ''

      el.material.onBeforeCompile = (shader) => {
        shader.uniforms = { ...shader.uniforms, ...this._water }

        shader.vertexShader = shader.vertexShader.replace('#include <common>', custVertParIncl)
        shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>', custVertIncl)

        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', custFragParIncl)
        shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', custFragIncl)

      }


      el.receiveShadow = true
      el.castShadow = true

    }

    this.Scene.traverse(swapToMeshToonMaterial)

  }

  _InitSky() {
    this._sky = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      elevation: 7,
      azimuth: -32.4,
      exposure: this.Renderer.toneMappingExposure,
      cloudCoverage: 0.4,
      cloudDensity: 0.4,
      cloudElevation: 0.5,
    }

    this.Sky = new Sky();
    this.Sky.scale.setScalar(450000);
    this.Scene.add(this.Sky);

    const sun = new THREE.Vector3()

    const uniforms = this.Sky.material.uniforms;

    uniforms['turbidity'].value = this._sky.turbidity;
    uniforms['rayleigh'].value = this._sky.rayleigh;
    uniforms['mieCoefficient'].value = this._sky.mieCoefficient;
    uniforms['mieDirectionalG'].value = this._sky.mieDirectionalG;
    uniforms['cloudCoverage'].value = this._sky.cloudCoverage;
    uniforms['cloudDensity'].value = this._sky.cloudDensity;
    uniforms['cloudElevation'].value = this._sky.cloudElevation;

    const phi = THREE.MathUtils.degToRad(90 - this._sky.elevation);
    const theta = THREE.MathUtils.degToRad(this._sky.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms['sunPosition'].value.copy(sun);

    this.Renderer.toneMappingExposure = this._sky.exposure;
  }

  init() {
    this._InitScene()
    this._InitCamera()
    this._InitLightning()
    this._InitRenderer()
  }

  registerDebugger() {
    if (!this.debug.active) return

    const sun = this.debug.ui.addFolder({ title: 'lights' })
    sun.addBinding(this._sun, 'intensity', { min: .1, max: 10, step: .1, label: 'sun' }).on('change', () => this.Sun.intensity = this._sun.intensity)
    sun.addBinding(this.Ambient, 'intensity', { min: .1, max: 5, step: .1, label: 'ambient' })

    const w = {
      color: '#' + this._water.uWaterColor.value.getHexString()
    }
    const water = this.debug.ui.addFolder({ title: 'water' })
    water.addBinding(this._water.uWaterHeight, 'value', { min: 0, max: 3, step: .01, label: 'height' })
    water.addBinding(this._water.uFoamWidth, 'value', { min: 0.01, max: .1, step: .001, label: 'foam' })
    water.addBinding(w, 'color').on('change', () => {
      this._water.uWaterColor.value.set(w.color)
    })

  }

  update() {
    this.Renderer.render(this.Scene, this.Camera)
    this.Controls.update()
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
