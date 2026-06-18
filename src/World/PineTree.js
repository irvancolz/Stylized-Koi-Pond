import Entities from "./ExperienceObject";
import * as THREE from 'three'

export default class PineTree extends Entities {
  constructor(seed = []) {
    super();
    this._seed = seed
  }

  init() {
    this._model = this.Resources['pinetree_model']

    const mat = new THREE.Object3D()
    for (let i = 0; i < this._seed.length; i++) {
      const ref = this._seed[i]
      const obj = this._model.scene.clone()
      obj.matrix = mat.matrix.clone()

      obj.quaternion.copy(new THREE.Quaternion(...ref.rotation))
      obj.scale.copy(new THREE.Vector3(...ref.scale))
      obj.position.copy(new THREE.Vector3(...ref.translation))
      this.Graphics.Scene.add(obj)
    }

  }

}
