import { data } from "../Utils/mock";
import Entities from "./ExperienceObject";
import * as THREE from 'three'

export class BirchTree extends Entities {
  constructor() {
    super()

    const COUNT = 40
    this._reffs = data.seeder(COUNT, 12)
    this._instances = []
  }

  init() {

    const foliages = []
    this._mesh = this.Resources['birchtree_model'].scene

    this._mesh.traverse(el => {
      if (el.name.toLowerCase().includes('foliage')) foliages.push(el)
    })

    for (let i = 0; i < this._reffs.length; i++) {
      const mesh = this._mesh.clone()

      const bushes = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: '#18db77' }))
      foliages.forEach(el => {
        const b = bushes.clone()
        b.position.copy(el.position);
        b.rotation.copy(el.rotation);
        // b.scale.copy(el.scale);

        mesh.add(b)

      })

      const reff = this._reffs[i]
      mesh.position.copy(new THREE.Vector3(...reff.translation))
      mesh.scale.copy(new THREE.Vector3(...reff.scale))
      // mesh.quaternion.copy(new THREE.Quaternion(...reff.rotation))


      this._instances.push(mesh)

      this.Graphics.Scene.add(mesh)
    }

  }

  dispose() {
    for (let i = 0; i < this._instances.length; i++) {
      const mesh = this._instances[i]

      this.Graphics.Scene.remove(mesh)
    }
  }
}
