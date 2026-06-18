
import Entities from "./ExperienceObject";

export default class LotusFlower extends Entities {
  constructor() {
    super()
  }

  init() {
    this._model = this.Resources['lotusflower_model']
    this.Graphics.Scene.add(this._model.scene)
  }

}
