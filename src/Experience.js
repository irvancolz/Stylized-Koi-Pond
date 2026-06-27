import States from "./States";
import Graphics from "./Graphics";

let instance = null;

export default class Experience {
  constructor(canvas, debug) {
    if (instance) {
      return instance;
    }
    instance = this;
    this.debug = debug
    this.canvas = canvas;
    this.resources = {}
    this.started = false;
    this.fishes = []
    // non-fish object
    this.entities = []

    this.states = new States();
    this.Graphics = new Graphics(canvas, debug)

    this.states.time.on("tick", () => {
      // on tick
      this.update()
      this.Graphics.update()
    });

    this.states.sizes.on("resize", () => {
      // on resize
      this.Graphics.resize()
    });
  }

  dispose() {
    this.started = false;

    for (let e = 0; e < this.entities.length; e++) {
      const entity = this.entities[e]
      entity.dispose()
    }

    for (let f = 0; f < this.fishes.length; f++) {
      const fish = this.fishes[f]
      fish.dispose(this.fishes)
    }

  }
  update() {
    const delta = this.states.time.delta

    for (let e = 0; e < this.entities.length; e++) {
      const entity = this.entities[e]
      entity.update()
    }

    for (let f = 0; f < this.fishes.length; f++) {
      const fish = this.fishes[f]
      fish.update(delta, this.fishes)
    }

  }

  init(res) {
    this.started = true;
    this.resources = res

    for (let e = 0; e < this.entities.length; e++) {
      const entity = this.entities[e]
      entity.setGraphics(this.Graphics)
      entity.setDebug(this.debug)
      entity.setResources(res)
      entity.setStates(this.states)
      entity.init()
    }

    for (let f = 0; f < this.fishes.length; f++) {
      const fish = this.fishes[f]
      fish.setGraphics(this.Graphics)
      fish.setDebug(this.debug)
      fish.setResources(res)
      fish.setStates(this.states)
      fish.init()
    }

    this.Graphics.modifyMaterial()
  }

  addFish(entities) {
    if (Array.isArray(entities)) {
      for (let i = 0; i < entities.length; i++) {
        this.addFish(entities[i])
      }
    } else {
      this.fishes.push(entities)
    }
  }

  addEntity(entities) {
    if (Array.isArray(entities)) {
      for (let i = 0; i < entities.length; i++) {
        this.addEntity(entities[i])
      }
    } else {
      this.entities.push(entities)
    }
  }

  registerDebugger() {
    this.Graphics.registerDebugger()

    for (let e = 0; e < this.entities.length; e++) {
      const entity = this.entities[e]
      entity.registerDebugger()
    }

    for (let f = 0; f < this.fishes.length; f++) {
      const fish = this.fishes[f]
      fish.registerDebugger()
    }

  }
}
