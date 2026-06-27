import * as THREE from "three";
import { FullScreenQuad, Pass } from "three/examples/jsm/Addons.js";
import { fragment, vertex } from "../Shaders/Outline.js";

export class OutlinePass extends Pass {
  constructor() {
    super();

    this.uniforms = {
      tDiffuse: new THREE.Uniform(null),
      resolution: new THREE.Uniform(
        new THREE.Vector2(window.innerWidth, window.innerHeight).multiplyScalar(
          Math.min(window.devicePixelRatio, 2),
        ),
      ),
      uLineColor: new THREE.Uniform(new THREE.Color(0x000000)),
    },

      this.material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: this.uniforms
      });
    this.fsQuad = new FullScreenQuad(this.material);


  }

  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }

  render(
    renderer,
    writeBuffer,
    readBuffer,
  ) {


    this.material.uniforms.tDiffuse.value = readBuffer.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
}
