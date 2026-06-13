class Entities {
  constructor() { }

  setGraphics(graphic) {
    this.Graphics = graphic;
  }

  setStates(res) {
    this.States = res;
  }

  setResources(res) {
    this.Resources = res;
  }

  setDebug(debug) {
    this.Debug = debug;
  }

  update() { }

  dispose() { }

  init() { }

  registerDebugger() { }
}

export default Entities;
