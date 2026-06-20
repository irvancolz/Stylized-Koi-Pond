import * as THREE from 'three'
import Entities from "./ExperienceObject";

export default class TallGrass extends Entities {
  constructor(reffs = []) {
    super()
    this._reffs = reffs
    this._meshes = []
  }
  init() {
    this._model = this.Resources['tallgrass_model']
    for (let i = 0; i < this._reffs.length; i++) {
      const mesh = this._model.scene.clone()
      mesh.position.copy(new THREE.Vector3(...this._reffs[i].translation))
      mesh.scale.copy(new THREE.Vector3(...this._reffs[i].scale))
      mesh.quaternion.copy(new THREE.Quaternion(...this._reffs[i].rotation))

      this.Graphics.Scene.add(mesh)
      this._meshes.push(mesh)
    }

  }

  update() {
  }

}
