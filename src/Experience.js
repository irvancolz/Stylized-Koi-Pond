import * as THREE from "three";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Light from "./Light";
import Debugger from "./Debugger";
import States from "./States";

let instance = null;

export default class Experience {
  constructor(canvas) {
    if (instance) {
      return instance;
    }
    instance = this;

    this.started = false;

    this.debug = new Debugger();
    this.states = new States();
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    this.camera = new Camera({
      scene: this.scene,
      sizes: this.states.sizes,
      canvas: this.canvas,
    });

    this.light = new Light({ scene: this.scene, debug: this.debug });

    this.renderer = new Renderer({
      scene: this.scene,
      sizes: this.states.sizes,
      canvas: this.canvas,
      camera: this.camera.instance,
    });

    this.states.time.on("tick", () => {
      if (this.world) {
        this.world.update();
      }
      // on tick
      this.camera.update();
      this.renderer.update();
    });

    this.states.sizes.on("resize", () => {
      // on resize
      this.camera.resize();
      this.renderer.resize();
    });
  }

  init() {
    this.started = true;
    this.world.init();
  }

  dispose() {
    this.world.dispose();
    this.started = false;
  }

  setWorld(world) {
    this.world = world;
    this.world.setScene(this.scene);
    this.world.setDebug(this.debug);
  }
}
