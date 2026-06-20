import * as THREE from 'three'
import Entities from "./ExperienceObject";

export default class Stones extends Entities {
  constructor(reffs = []) {
    super()
    this._reffs = reffs
    this._meshes = []
  }
  init() {
    this._model_round = this.Resources['stoneround_model']
    this._model_tall = this.Resources['stonetall_model']
    for (let i = 0; i < this._reffs.length; i++) {
      const reff = this._reffs[i]

      // unavail model
      if (reff.name.includes('Sharp')) continue;

      const mesh = reff.name.includes('Tall') ? this._model_tall.scene.clone() : this._model_round.scene.clone()
      mesh.position.copy(new THREE.Vector3(...reff.translation))
      mesh.scale.copy(new THREE.Vector3(...reff.scale))
      mesh.quaternion.copy(new THREE.Quaternion(...reff.rotation))

      this.Graphics.Scene.add(mesh)
      this._meshes.push(mesh)
    }

  }

}
