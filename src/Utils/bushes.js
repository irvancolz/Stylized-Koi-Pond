import * as THREE from 'three'
export const bushes = (function() {
  return {
    createGeometry: (sections = [], density = 40) => {
      const geometry = new THREE.BufferGeometry()

      const positions = []
      const indicies = []
      const normals = []
      const uv = []

      const W = 1
      const L = 1

      let leaves_id = 0
      const createLeaves = (origin, orientation, scale, idx) => {
        // i wish everyone whoo made bushes too big have strong device :p
        const LEAVES_COUNT = density * Math.pow(scale.length(), 2);

        for (let i = 0; i < LEAVES_COUNT; i++) {
          // Random point on sphere surface
          const dir = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
          ).normalize()

          // Position on sphere surface
          const pos = new THREE.Vector3()
            .copy(dir)
            .multiply(scale)
            .add(origin)

          // Forward vector pointing toward origin
          const forward = new THREE.Vector3()
            .copy(origin)
            .sub(pos)
            .normalize()

          // Build rotation so +Z points at origin
          const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            forward
          )

          // Random roll around facing direction
          const roll = new THREE.Quaternion().setFromAxisAngle(
            forward,
            Math.random() * Math.PI * 2
          )

          quat.multiply(roll)

          const v = [
            new THREE.Vector3(-W / 2, L / 2, 0),
            new THREE.Vector3(-W / 2, -L / 2, 0),
            new THREE.Vector3(W / 2, L / 2, 0),
            new THREE.Vector3(W / 2, -L / 2, 0),].map(el => el.applyEuler(orientation).applyQuaternion(quat).add(pos))
          positions.push(...v[0].toArray(), ...v[1].toArray(), ...v[2].toArray(), ...v[3].toArray())

          const i4 = leaves_id * 4
          indicies.push(i4, i4 + 1, i4 + 2, i4 + 2, i4 + 1, i4 + 3)
          uv.push(0, 1, 0, 0, 1, 1, 1, 0)

          const n = new THREE.Vector3(0, 0, 1)
          const n0 = new THREE.Vector3().copy(n).add(v[0]).sub(origin).normalize()
          const n1 = new THREE.Vector3().copy(n).add(v[1]).sub(origin).normalize()
          const n2 = new THREE.Vector3().copy(n).add(v[2]).sub(origin).normalize()
          const n3 = new THREE.Vector3().copy(n).add(v[3]).sub(origin).normalize()
          // normals.push(...n0.toArray(), ...n1.toArray(), ...n2.toArray(), ...n3.toArray())

          const normal = forward;
          normals.push(...normal.toArray(), ...normal.toArray(), ...normal.toArray(), ...normal.toArray())
          leaves_id++
        }

      }

      for (let i = 0; i < sections.length; i++) {
        const origin = sections[i].position
        const orientation = sections[i].rotation
        const scale = sections[i].scale
        createLeaves(origin, orientation, scale, i)
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2))
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indicies), 1))

      return geometry
    }
  }
})()
