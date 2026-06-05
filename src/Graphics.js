import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export default class Graphic {
  constructor(canvas) {
    this.$canvas = canvas
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
    this.Camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 1, 100)
    this.Camera.position.y = 10
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

  init() {
    this._InitScene()
    this._InitCamera()
    this._InitRenderer()
  }

  update() {
    this.Renderer.render(this.Scene, this.Camera)
  }

  resize() {
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight

    this.Camera.aspect = this.sizes.width / this.sizes.height
    this.Camera.updateProjectionMatrix()

    this.Renderer.setSize(this.sizes.width, sizes.height)
    this.Renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

    this.Renderer.render(this.Scene, this.Camera)
  }

  init() {
    this._InitScene()
    this._InitCamera()
    this._InitRenderer()
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

  }

}
