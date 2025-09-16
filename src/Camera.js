import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

export default class Camera {
  static instance = null;
  static getInstance() {
    return Camera.instance;
  }
  constructor({ scene, sizes, canvas }) {
    if (Camera.instance != null) return Camera.instance;

    Camera.instance = this;

    this.scene = scene;
    this.sizes = sizes;
    this.canvas = canvas;

    // Setup
    this.init();
    this.addControls();
  }

  init() {
    const camera = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.target = new THREE.Vector3(0, 0.1, 0);
    camera.position.set(0, 1, 1.45).multiplyScalar(10);
    camera.lookAt(this.target);
    this.instance = camera;
    this.scene.add(camera);
  }

  addControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.target = this.target;
    this.controls.enableDamping = true;
  }

  update() {
    this.controls.update();
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }
}
