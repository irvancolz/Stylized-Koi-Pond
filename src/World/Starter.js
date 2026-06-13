import * as THREE from "three";
import Entities from "./ExperienceObject";

class Starter extends Entities {
  constructor() {
    super();
  }

  init() {
    this._model = this.Resources["statue_model"]
    this._model.scene.traverse(e => {
      if (e.isMesh) {
        e.material.side = THREE.DoubleSide
        e.castShadow = true
        e.receiveShadow = true
        e.material.color = new THREE.Color('#ff00ff')
      }
    })

    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: '#000000' }))
    this.ground.rotateX(-Math.PI * .5)
    this.Graphics.Scene.add(this._model.scene)
  }

  update() {
    if (this._model) {
      this._model.scene.rotation.y = this.States.time.elapsed * .0001
    }
  }
}

export default Starter;
