import Experience from "./Experience";
import "./style.css";
import Starter from "./World/Starter";
import Fish from "./World/Fish";
import Debugger from "./Debugger";
import ResourcesLoader from "./Utils/ResourcesLoader";
import resources from "./resources";
import Water from "./World/Water";
import seed from './seed.json'
import PineTree from "./World/PineTree";
import Ground from "./World/Ground";
import LotusLeaves from "./World/LotusLeaves";
import LotusFlower from "./World/LotusFlower";
import Fountain from "./World/Fountain";

const canvas = document.getElementById("canvas");
const debug = new Debugger()
const experience = new Experience(canvas, debug);

const FISH_CONFIG = {
  maxSpeed: .01,
  maxSteering: .01
}

const schools = []
const FISH_COUNT = 40;
for (let i = 0; i < FISH_COUNT; i++) {
  const fish = new Fish(FISH_CONFIG)
  schools.push(fish)
}
experience.addFish(schools)

const fountain = new Fountain()
experience.addEntity(fountain)

const ground = new Ground()
experience.addEntity(ground)

const lotusleaves = new LotusLeaves()
experience.addEntity(lotusleaves)

const lotusflower = new LotusFlower()
experience.addEntity(lotusflower)

const water = new Water()
experience.addEntity(water)

const pineReffs = seed.filter(el => el.name.toLowerCase().includes('pinetree'))
const pineTree = new PineTree(pineReffs)
experience.addEntity(pineTree);

const starter = new Starter();
// experience.addEntity(starter);

const loader = new ResourcesLoader(resources)
loader.on('finish:loaded', () => {
  experience.init(loader.resources);
  window.experience = experience;
})

// register Debugger
if (debug.active) {
  experience.registerDebugger()

  const fishDebugger = debug.ui.addFolder({ title: 'fish' })
  fishDebugger.addBinding(FISH_CONFIG, 'maxSpeed', { min: .01, max: .2, step: .01 })
  fishDebugger.addBinding(FISH_CONFIG, 'maxSteering', { min: .001, max: .01, step: .010 })
}
