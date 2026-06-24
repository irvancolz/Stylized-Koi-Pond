import * as THREE from 'three'
import Entities from "./ExperienceObject";

export default class LotusFlower extends Entities {
  constructor(reffs = []) {
    super()
    this._reffs = reffs
    this._meshes = []
  }
  init() {
    this._model = this.Resources['lotusflower_model']
    for (let i = 0; i < this._reffs.length; i++) {
      const mesh = this._model.scene.clone()
      mesh.position.copy(new THREE.Vector3(...this._reffs[i].translation))
      mesh.scale.copy(new THREE.Vector3(...this._reffs[i].scale))

      this.Graphics.Scene.add(mesh)
      this._meshes.push(mesh)
    }

  }

  update() {
    if (this.Graphics) {

      this._meshes.forEach(flower => {
        flower.position.y = this.Graphics._water.uWaterHeight.value + this.Graphics._water.uFoamWidth.value
      })

    }
  }

}
