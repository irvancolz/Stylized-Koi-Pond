export default class Loading {
  constructor() {
    this.enabled = true
    this._started = true

    this._Init()
  }

  _Init() {
    this._$container = document.createElement('div')
    this._$container.setAttribute('id', 'loading')

    this._$container.innerHTML = `
      <div class='loading_content'>
        <img class='loading_img' src='./loading.png' />
        <p class='loading_text'>loading</p>
      </div>

    `

    document.body.appendChild(this._$container)
    this._UpdateStyle()
  }

  _UpdateStyle() {
    this._$container.setAttribute('data-visible', this._started)
  }

  start() {
    if (!this.enabled) {
      this._started = false
    } else {
      this._started = true
    }
    this._UpdateStyle()
  }

  finish() {
    this._started = false
    this._UpdateStyle()
  }
}
