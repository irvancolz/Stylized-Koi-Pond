import { bushes } from "../Utils/bushes";
import Entities from "./ExperienceObject";
import * as THREE from 'three'

export class BirchTree extends Entities {
  constructor(reffs) {
    super()
    this._reffs = reffs
    this._foliages = {}
    this._stem = {}
  }

  _CreateFoliages(sections) {

    this._foliages.material = new THREE.MeshToonMaterial({
      alphaTest: .5,
      depthWrite: false,
      transparent: true,
      side: THREE.DoubleSide,
      // wireframe: true,
    })
    this._foliages.material.alphaMap = this.Resources['leaves']
    this._foliages.geometry = bushes.createGeometry(sections)
    this._foliages.mesh = new THREE.InstancedMesh(this._foliages.geometry, this._foliages.material, this._reffs.length)
    this._foliages.mesh.castShadow = true
    this._foliages.mesh.receiveShadow = true

    this._foliages.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
      alphaTest: .5,
      transparent: true,
      depthPacking: THREE.RGBADepthPacking,
    })
    this._foliages.mesh.customDepthMaterial.alphaMap = this.Resources['leaves']
    // this._mesh.position.copy(this._position)

    this.Graphics.Scene.add(this._foliages.mesh)

  }

  _CreateStem() {
    this._stem.mesh = new THREE.InstancedMesh(this._stem.geometry, this._stem.material, this._reffs.length);
    this.Graphics.Scene.add(this._stem.mesh)
  }

  init() {

    const foliages = []
    this._mesh = this.Resources['birchtree_model'].scene

    this._mesh.traverse(el => {
      if (el.name.toLowerCase().includes('foliage')) foliages.push(el)
      if (el.isMesh) {
        this._stem.geometry = el.geometry
        this._stem.material = el.material
      }
    })

    this._CreateFoliages(foliages)
    this._CreateStem()

    const dummy = new THREE.Object3D()
    for (let i = 0; i < this._reffs.length; i++) {
      dummy.position.copy(new THREE.Vector3(...this._reffs[i].translation))
      dummy.quaternion.copy(new THREE.Quaternion(...this._reffs[i].rotation))
      dummy.scale.copy(new THREE.Vector3(...this._reffs[i].scale))

      dummy.updateMatrix()

      this._stem.mesh.setMatrixAt(i, dummy.matrix)
      this._foliages.mesh.setMatrixAt(i, dummy.matrix)
    }

  }

  dispose() {
    this.Graphics.Scene.remove(this._stem.mesh)
    this.Graphics.Scene.remove(this._foliages.mesh)
  }
}
