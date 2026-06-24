import * as THREE from 'three'
import Entities from "./ExperienceObject";

const vertexShader = `
  varying vec3 vNormal;
  varying vec2 vUv;

  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    vNormal = normal;
    vUv = uv;
  }

`
const fragmentShader = `
  uniform sampler2D uAlphaTexture;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main(){
    vec3 color = vec3(1.);
    float alpha = texture(uAlphaTexture, vUv).r;

    if(alpha <= 0.) discard;

    gl_FragColor = vec4(color, 1.);
  }

`

export default class Bushes extends Entities {
  constructor(position, sections,) {
    super()

    this._position = position
    this._sections = sections

    this._InitGeometry()
    this._material = new THREE.MeshStandardMaterial({
      alphaTest: .5,
      depthWrite: false,
      transparent: true
    })
    // this._material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, side: THREE.DoubleSide, })
    this._mesh = new THREE.Mesh(this._geometry, this._material)
    this._mesh.position.copy(this._position)
  }

  _InitGeometry() {
    const positions = []
    const indicies = []
    const normals = []
    const uv = []

    const LEAVES_COUNT = 100;
    const W = 1
    const L = 1


    const createLeaves = (origin, orientation, idx) => {
      for (let i = 0; i < LEAVES_COUNT; i++) {
        const rot = new THREE.Euler(0, Math.random() * Math.PI * 2, 0)
        const x = (Math.random() - .5) * 2
        const y = (Math.random() - .5) * 2
        const z = (Math.random() - .5) * 2
        const pos = new THREE.Vector3(x, y, z).add(origin)

        const v = [
          new THREE.Vector3(-W / 2, L / 2, 0),
          new THREE.Vector3(-W / 2, -L / 2, 0),
          new THREE.Vector3(W / 2, L / 2, 0),
          new THREE.Vector3(W / 2, -L / 2, 0),].map(el => el.applyEuler(orientation).applyEuler(rot).add(pos))
        positions.push(...v[0].toArray(), ...v[1].toArray(), ...v[2].toArray(), ...v[3].toArray())

        const i4 = idx * LEAVES_COUNT * 4 + i * 4
        indicies.push(i4, i4 + 1, i4 + 2, i4 + 1, i4 + 2, i4 + 3)
        uv.push(0, 1, 0, 0, 1, 1, 1, 0)

        const n = new THREE.Vector3(0, 0, 1)
        const n0 = new THREE.Vector3().copy(n).add(v[0]).sub(origin).normalize()
        const n1 = new THREE.Vector3().copy(n).add(v[1]).sub(origin).normalize()
        const n2 = new THREE.Vector3().copy(n).add(v[2]).sub(origin).normalize()
        const n3 = new THREE.Vector3().copy(n).add(v[3]).sub(origin).normalize()
        normals.push(...n0.toArray(), ...n1.toArray(), ...n2.toArray(), ...n3.toArray())

      }

    }

    for (let i = 0; i < this._sections.length; i++) {
      const x = (Math.random() - .5) * 2
      const y = (Math.random() - .5) * 2
      const z = (Math.random() - .5) * 2
      const origin = this._sections[i].position
      const orientation = new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
      createLeaves(origin, orientation, i)
    }

    this._geometry = new THREE.BufferGeometry()
    this._geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    this._geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
    this._geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2))
    this._geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indicies), 1))
  }

  init() {
    this._material.alphaMap = this.Resources['leaves']
    this.Graphics.Scene.add(this._mesh)
  }
}
