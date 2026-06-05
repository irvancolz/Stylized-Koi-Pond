import * as THREE from 'three'
import Entities from "./ExperienceObject";
import { math } from '../Utils/math';

class Fish extends Entities {
  constructor({ maxSpeed = .1, maxSteeringForce = .01 }) {
    super()
    this._maxSpeed = maxSpeed
    this._maxSteeringForce = maxSteeringForce
    this._mesh = new THREE.Mesh(new THREE.BoxGeometry(.2, .2, .2), new THREE.MeshBasicMaterial())

    this._position = new THREE.Vector3(math.rand_range(-10, 10), math.rand_range(0, 4), math.rand_range(-10, 10))
    this._acceleration = new THREE.Vector3(math.rand_range(-1, 1), math.rand_range(-1, 1), math.rand_range(-1, 1))
    this._velocity = new THREE.Vector3().copy(this._acceleration)
  }

  init() {
    this.Graphics.Scene.add(this._mesh)
  }

  get Position() {
    return this._position;
  }

  get Velocity() {
    return this._velocity;
  }

  get Acceleration() {
    return this._acceleration;
  }

  _onOutOfBound() {
    if (this.Position.x > 10) this.Position.x = -10
    if (this.Position.x < -10) this.Position.x = 10

    if (this.Position.y > 4) this.Position.y = 0
    if (this.Position.y < 0) this.Position.y = 4

    if (this.Position.z > 10) this.Position.z = -10
    if (this.Position.z < -10) this.Position.z = 10
  }

  _applyAlignment(schools) {
    const force = new THREE.Vector3()
    if (schools.length == 0) return force

    for (const i of schools) {

      const dir = new THREE.Vector3().subVectors(this.Position, i.Position)
      const distance = dir.length()
      const multiplier = 1 / distance

      force.add(i.Velocity)
    }

    force.multiplyScalar(1 / schools.length)
    return force
  }

  _applySeparation(schools) {
    const force = new THREE.Vector3()
    if (schools.length == 0) return force

    for (const i of schools) {

      const dir = new THREE.Vector3().subVectors(this.Position, i.Position)
      const distance = dir.length()
      const multiplier = 1 / distance

      force.add(dir.multiplyScalar(multiplier))
    }
    force.multiplyScalar(1 / schools.length)
    force.multiplyScalar(.1)

    return force
  }

  _applyCohesion(schools) {
    const force = new THREE.Vector3()
    if (schools.length == 0) return force

    for (const i of schools) {
      force.add(i.Position)
    }
    force.multiplyScalar(1 / schools.length)

    const avgPosition = new THREE.Vector3().subVectors(force, this.Position)
    avgPosition.multiplyScalar(.1)

    return avgPosition
  }

  _applySteering(schools) {
    const forces = [this._applyAlignment(schools), this._applySeparation(schools), this._applyCohesion(schools)]
    const steeringForce = new THREE.Vector3(0, 0, 0)

    for (const f of forces) {
      steeringForce.add(f)
    }

    // avg the forces
    //steeringForce.multiplyScalar(1/schools.length)

    // control strength of each axis
    steeringForce.multiply(new THREE.Vector3(1, .25, 1))


    if (steeringForce.length() > this._maxSteeringForce) {
      steeringForce.normalize()
      steeringForce.multiplyScalar(this._maxSteeringForce)
    }

    this._velocity.add(steeringForce)

    if (this._velocity.length() > this._maxSpeed) {
      this._velocity.normalize()
      this._velocity.multiplyScalar(this._maxSpeed)
    }

  }

  update(schools) {
    const radius = 1
    const local = schools.filter(e => {
      const d = e.Position.distanceTo(this.Position)
      return d != 0 && d <= radius
    })
    this._onOutOfBound()
    this._applySteering(local)

    this._position.add(this._velocity)
    if (this._mesh) {
      this._mesh.position.copy(this._position)
    }
  }

  dispose() {
    this.Graphics.Scene.remove(this._mesh)
  }
}

export default Fish
