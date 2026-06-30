import * as THREE from "three";
import Entities from "./ExperienceObject";

class Starter extends Entities {
  constructor() {
    super();
  }

  init() {
    this._model = this.Resources["koinobori_model"]
    this._model.scene.traverse(e => {
      if (e.isMesh) {
        e.material.side = THREE.DoubleSide
        e.castShadow = true
        e.receiveShadow = true
      }
    })
    this._model.scene.position.y = 5
    this._model.scene.rotateX(Math.PI)

    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: '#ffffff' }))
    this.ground.receiveShadow = true
    this.ground.rotateX(-Math.PI * .5)
    this.ground.position.y = 1
    // this.Graphics.Scene.add(this.ground)
    this.Graphics.Scene.add(this._model.scene)
  }

  update() {
    if (this._model) {
      // this._model.scene.rotation.y = this.States.time.elapsed * .0001
    }
  }
}

export default Starter;
