import Entities from "./ExperienceObject";

export default class Ground extends Entities {
  constructor() {
    super()
  }

  init() {
    this._model = this.Resources['ground_model']
    this.Graphics.Scene.add(this._model.scene)
  }
}
