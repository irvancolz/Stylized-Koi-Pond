import * as THREE from 'three'
import Entities from "./ExperienceObject";
import { math } from '../Utils/math';
import { SkeletonUtils } from 'three/examples/jsm/Addons.js';

const TURN_ANIMATION_INTENSITY_MIN = .001
const SPREAD = 10
let id = 0

class Fish extends Entities {
  constructor({ maxSpeed = .1, maxSteeringForce = .01 }) {
    super()
    this._maxSpeed = maxSpeed
    this._maxSteeringForce = maxSteeringForce

    this._tl = {}
    this._bones = {}
    const r = SPREAD
    this._position = new THREE.Vector3(math.rand_range(-r, r), 1, math.rand_range(-r, r))
    this._velocity = new THREE.Vector3(math.rand_range(-1, 1), 0, math.rand_range(-1, 1))
  }

  init() {
    id++
    this._id = id
    this._offset = id + Math.random()

    const gltf = this.Resources["fish_model"]
    this._mesh = SkeletonUtils.clone(gltf.scene)

    this._mesh.traverse(el => {
      if (el.isMesh) {
        el.material = new THREE.MeshBasicMaterial({ color: this._id == 1 ? 0xff00 : 0xffffff, side: THREE.DoubleSide })
      }
      if (el.type == 'Bone') this._bones[el.name] = {
        bones: el,
        rest: el.rotation.clone(),
        target: el.rotation.clone(),
        progress: 1
      }
    })

    this.Graphics.Scene.add(this._mesh)

    // this._registerEvents()
  }

  get Position() {
    return this._position;
  }

  get Velocity() {
    return this._velocity;
  }

  _onOutOfBound() {
    const r = SPREAD
    if (this.Position.x > r) this.Position.x = -r
    if (this.Position.x < -r) this.Position.x = r

    if (this.Position.y > 4) this.Position.y = 0
    if (this.Position.y < 0) this.Position.y = 4

    if (this.Position.z > r) this.Position.z = -r
    if (this.Position.z < -r) this.Position.z = r
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
    steeringForce.multiply(new THREE.Vector3(1, 0, 1))


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

  _registerEvents() {
    window.addEventListener('keydown', e => {
      let type = ''

      if (e.code == 'KeyA') {
        type = 'left'
      } else if (e.code == 'KeyD') {
        type = 'right'
      } else {
        type = ''
      }
      if (type != '') {
        const dirMult = type == 'left' ? 1 : -1
        const dirIntensity = 1
        for (const key in this._bones) {
          console.log(this._bones[key].bones.name)
        }

        // animate bones
        // gsap.to(this._bones["Cauldal_Top"].bones.rotation, {
        //   z: dirMult * Math.PI * .13,
        //   duration: .3,
        //   ease: "power1.out"
        // })
        // gsap.to(this._bones["Cauldal_Bot"].bones.rotation, {
        //   z: dirMult * Math.PI * .15,
        //   duration: .3,
        //   ease: "power1.out"
        // })
        // gsap.to(this._bones["Head"].bones.rotation, {
        //   z: dirMult * Math.PI * .04,
        //   duration: .3,
        //   ease: "power1.out"
        // })
        //
        // for (let i = 0; i < 2; i++) {
        //   gsap.to(this._bones[`Cauldal${i == 0 ? '' : `00${i}`}`].bones.rotation, {
        //     z: dirMult * Math.PI * .15,
        //     duration: .3,
        //     ease: "power1.out"
        //   })
        // }
        // if (type == 'left') {
        //
        //   this._bones["Pectoral_L"].rotateZ(Math.PI * .5)
        //   this._bones["Pectoral_R"].rotation.z = 0
        // } else {
        //
        //   this._bones["Pectoral_R"].rotateZ(-Math.PI * .5)
        //   this._bones["Pectoral_L"].rotation.z = 0
        // }
        //

        // gsap.to(this._bones["Anal_L"].rotation, {
        //   z: dirMult * -Math.PI * .01,
        //   duration: .3,
        //   ease: "power1.out"
        // })
      }

    })
  }

  _animateHead(dir, intensity) {
    const elapsed = this.States?.time.elapsed || 0
    const delta = this.States?.time.delta || 0
    if (this._bones['Head']) {
      this._bones['Head'].bones.rotation.z = Math.sin(-elapsed * .005) * .08
    }
  }

  _animatePectoral(_dir, _intensity) {
    const delta = this.States?.time.delta || 0
    const pectoral = _dir > 0 ? 'Pectoral_L' : 'Pectoral_R'

    if (!this._bones[pectoral]) return

    ['Pectoral_L', 'Pectoral_R'].forEach(p => {


      const restVec = new THREE.Vector3().setFromEuler(this._bones[p].rest)
      const targetVec = new THREE.Vector3().setFromEuler(this._bones[p].target)

      this._bones[p].progress = Math.min(1, this._bones[p].progress + delta * .002)
      const currVec = new THREE.Vector3().lerpVectors(targetVec, restVec, this._bones[p].progress)
      this._bones[p].bones.rotation.setFromVector3(currVec, this._bones[p].rest.order)

    })

    if (_intensity < TURN_ANIMATION_INTENSITY_MIN) return

    const targetEuler = this._bones[pectoral].rest.clone()
    targetEuler.z += Math.PI * .5 * _dir
    this._bones[pectoral].target = targetEuler
    this._bones[pectoral].progress = 0

  }

  _animateCauldal(dir, intensity) {
    const elapsed = (this.States?.time.elapsed || 0)
    const delta = this.States?.time.delta || 0

    const cauldal = this._bones['Cauldal']
    if (!cauldal) return

    const cauldalBones = ['Cauldal', 'Cauldal001']

    for (let i = 0; i < cauldalBones.length; i++) {
      const b = cauldalBones[i]

    }

    for (let i = 0; i < cauldalBones.length; i++) {
      const b = cauldalBones[i]

      if (this._bones[b].progress < 1) {
        const restVec = new THREE.Vector3().setFromEuler(this._bones[b].rest)
        const targetVec = new THREE.Vector3().setFromEuler(this._bones[b].target)

        this._bones[b].progress = Math.min(1, this._bones[b].progress + delta * .001)
        const currVec = new THREE.Vector3().lerpVectors(targetVec, restVec, this._bones[b].progress)
        this._bones[b].bones.rotation.setFromVector3(currVec, this._bones[b].rest.order)

      } else {
        this._bones[b].bones.rotation.z = Math.sin(elapsed * .005 + this._offset) * -.1
      }
      if (intensity >= TURN_ANIMATION_INTENSITY_MIN) {

        const targetEuler = this._bones[b].rest.clone()
        targetEuler.z = Math.PI * .2 * dir * intensity
        this._bones[b].target = targetEuler
        this._bones[b].progress = 0

      }
    }
  }
  _animateBones(dir, intensity) {
    // const turnIntensity = math.smoothstep(.1, 1, Math.abs(prev.x - curr.x))
    // // true == right
    // const turnDir = prev.x - curr.x

    this._animateHead(dir, intensity)
    this._animateCauldal(dir, intensity)
    this._animatePectoral(dir, intensity)
  }

  update(delta, schools) {
    const radius = 1
    const local = schools.filter(e => {
      const d = e.Position.distanceTo(this.Position)
      return d != 0 && d <= radius
    })
    this._onOutOfBound()

    const prevDir = this._velocity.clone().normalize()

    this._applySteering(local)

    const currDir = this._velocity.clone().normalize()

    const cross = new THREE.Vector3().crossVectors(prevDir, currDir)
    const _dir = math.normalize(cross.y)
    const _intensity = math.smoothstep(0.1, 1, cross.y)

    this._animateBones(_dir, _intensity)
    this._position.add(this._velocity)
    if (this._mesh) {
      this._mesh.position.copy(this._position)

      const direction = this.Velocity.clone().normalize();
      const m = new THREE.Matrix4();
      m.lookAt(
        new THREE.Vector3(0, 0, 0),
        direction,
        new THREE.Vector3(0, 1, 0));
      this._mesh.quaternion.setFromRotationMatrix(m);
    }


    // if (this._bones["Pectoral_L"]) {
    //   this._bones["Pectoral_L"].rotation.z += .001
    // }
  }

  dispose() {
    this.Graphics.Scene.remove(this._mesh)
  }
}

export default Fish
