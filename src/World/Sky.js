import * as THREE from "three";
import Entities from "./ExperienceObject";

const vertexShader = `
varying vec3 vColor;

uniform vec3 uHorizonColor;
uniform vec3 uSkyDayColor;
uniform vec3 uSunDirection;

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vec3 sunDirection = uSunDirection;

    float sunIntensity = dot(normal, sunDirection);
    sunIntensity = sunIntensity * .5 + .5;
    sunIntensity = pow(sunIntensity, 3.);

    vec3 color = vec3(sunIntensity);

    color = mix(uHorizonColor, uSkyDayColor, sunIntensity);

    // float sun = clamp(sunIntensity, 0., 1.);
    // sun = pow(sun, 5.);
    // color = mix(color, uSunColor, sun);

    vColor = color;
}`

const fragmentShader = `
    varying vec3 vColor;
    void main() { 
        gl_FragColor = vec4(vColor, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }
`

class Sky extends Entities {
  constructor() {
    super()

    this.debugConfig = {
      skyDayColor: "#05a8ff",
      horizonColor: "#dde1c8",
    };

    this.progress = 0;
    this.timeOfDay = 0;
    this.dayLength = 2000;

  }

  registerDebugger() {
    const f = this.Debug.ui.addFolder({ title: "sky", expanded: false });
    f.addBinding(this.debugConfig, "skyDayColor").on("change", () => {
      this.uniforms.uSkyDayColor.value.set(this.debugConfig.skyDayColor);
    });
    f.addBinding(this.debugConfig, "horizonColor").on("change", () => {
      this.uniforms.uHorizonColor.value.set(this.debugConfig.horizonColor);
    });
  }

  init() {
    this._initSun();
    this._initSky();
  }

  _initSky() {
    this.uniforms = {
      uSkyDayColor: new THREE.Uniform(
        new THREE.Color(this.debugConfig.skyDayColor)
      ),
      uHorizonColor: new THREE.Uniform(
        new THREE.Color(this.debugConfig.horizonColor)
      ),
      uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 1, 0)),
    };
    const w = 80 * 0.75;
    // const w = 4;
    this.geometry = new THREE.SphereGeometry(w, 64, 64);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: this.uniforms,
      // baseMaterial: THREE.MeshBasicMaterial,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.Graphics.Scene.add(this.mesh);
  }

  _initSun() {
    this.sun = {};
    this.sun.direction = new THREE.Vector3(0, 1, 0);
  }

  update() {
    this.timeOfDay += 1;
    this.progress = (this.timeOfDay % this.dayLength) / this.dayLength;

    if (this.sun) {
      const sunAngle = this.progress * Math.PI * 2;

      this.sun.direction.x = Math.cos(sunAngle);
      this.sun.direction.y = Math.sin(sunAngle);

      this.uniforms.uSunDirection.value.copy(this.sun.direction);
    }
  }
}

export default Sky;
