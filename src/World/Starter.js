import * as THREE from "three";
import ExperienceObject from "./ExperienceObject";

class Starter extends ExperienceObject {
  constructor() {
    super();
    this.pos = 0;
    this.radius = 2.5;

    this.geometry = new THREE.BoxGeometry();
    this.geometry.translate(0, 0.51, 0);

    this.material = new THREE.MeshBasicMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  init() {
    this.scene.add(this.mesh);
  }
  update() {
    this.pos += 0.02;

    this.mesh.position.x = Math.sin(this.pos) * this.radius;
    this.mesh.position.z = Math.cos(this.pos) * this.radius;
  }
}

export default Starter;
