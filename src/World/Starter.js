import * as THREE from "three";
import Entities from "./ExperienceObject";

class Starter extends Entities {
  constructor() {
    super();
  }

  init() {
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: '#000000' }))
    this.ground.rotateX(-Math.PI * .5)
    this.Graphics.Scene.add(this.ground)
  }

  update() {
  }
}

export default Starter;
