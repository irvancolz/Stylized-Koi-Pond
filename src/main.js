import Experience from "./Experience";
import "./style.css";
import Starter from "./World/Starter";
import Fish from "./World/Fish";
import Debugger from "./Debugger";

const canvas = document.getElementById("canvas");
const debug = new Debugger()
const experience = new Experience(canvas, debug);

const FISH_CONFIG = {
  maxSpeed: .02,
  maxSteering: .01
}

const schools = []
const FISH_COUNT = 150;
for (let i = 0; i < FISH_COUNT; i++) {
  const fish = new Fish(FISH_CONFIG)
  schools.push(fish)
}
experience.addFish(schools)

const starter = new Starter();
experience.addEntity(starter);

experience.init();
window.experience = experience;

// register Debugger
if (debug.active) {
  experience.registerDebugger()

  const fishDebugger = debug.ui.addFolder({ title: 'fish' })
  fishDebugger.addBinding(FISH_CONFIG, 'maxSpeed', { min: .01, max: .2, step: .01 })
  fishDebugger.addBinding(FISH_CONFIG, 'maxSteering', { min: .001, max: .01, step: .010 })
}
