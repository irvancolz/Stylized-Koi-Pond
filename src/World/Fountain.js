
import Entities from "./ExperienceObject";

export default class Fountain extends Entities {
  constructor() {
    super()
  }
  init() {
    this._model = this.Resources['statue_model']
    this.Graphics.Scene.add(this._model.scene)
  }
}
