import Entities from "./ExperienceObject";

export default class LotusLeaves extends Entities {
  constructor() {
    super()
  }
  init() {
    this._model = this.Resources['lotusleaves_model']
    this.Graphics.Scene.add(this._model.scene)
  }
}
