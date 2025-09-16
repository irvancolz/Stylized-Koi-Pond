import * as THREE from "three";
import ExperienceObject from "./ExperienceObject";
export default class World extends ExperienceObject {
  constructor(scene = null, debug = null) {
    super();
    this.scene = scene;
    this.debug = debug;

    this.children = [];
  }

  add(child) {
    this.children.push(child);
  }

  remove(child) {
    const idx = this.children.indexOf(child);
    if (0 > idx) return;
    const deleted = this.children.splice(idx, 1);
    deleted.dispose();
  }

  init() {
    this.children.forEach((child) => {
      child.setScene(this.scene);
      child.setDebug(this.debug);
      child.init();
    });
  }

  dispose() {
    this.children.forEach((child) => {
      child.dispose();
    });
  }

  update() {
    this.children.forEach((child) => {
      child.update();
    });
  }
}
