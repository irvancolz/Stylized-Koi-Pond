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
import Loading from "./Loading";
import { BirchTree } from "./World/BirchTree";
import Sky from "./World/Sky";
import Waterfall from "./World/Waterfall";
import TallGrass from "./World/TallGrass";
import Stones from "./World/Stones";
import Bushes from "./World/Bushes";
import Grass from "./World/Grass";

const loading = new Loading()

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

const sky = new Sky()
// experience.addEntity(sky)

const grass = new Grass()
// experience.addEntity(grass)

const bushesReffs = seed.filter(el => el.name.toLowerCase().includes('bushes'))
const bushes = new Bushes(bushesReffs)
// experience.addEntity(bushes)

const fountain = new Fountain()
// experience.addEntity(fountain)

const ground = new Ground()
// experience.addEntity(ground)

const stonesReffs = seed.filter(el => el.name.toLowerCase().includes('stone'))
const stones = new Stones(stonesReffs)
// experience.addEntity(stones)

const tallgrassReffs = seed.filter(el => el.name.toLowerCase().includes('tallgrass'))
const tallgrass = new TallGrass(tallgrassReffs)
// experience.addEntity(tallgrass)

const lotusLeavesReffs = seed.filter(el => el.name.toLowerCase().includes('lotusleaves'))
const lotusleaves = new LotusLeaves(lotusLeavesReffs)
// experience.addEntity(lotusleaves)

const lotusFlowerReffs = seed.filter(el => el.name.toLowerCase().includes('lotusflower'))
const lotusflower = new LotusFlower(lotusFlowerReffs)
// experience.addEntity(lotusflower)

const waterfall = new Waterfall()
// experience.addEntity(waterfall)

const water = new Water()
// experience.addEntity(water)

const pineReffs = seed.filter(el => el.name.toLowerCase().includes('pinetree'))
const pineTree = new PineTree(pineReffs)
// experience.addEntity(pineTree);

const birchTreeReffs = seed.filter(el => el.name.toLowerCase().includes('birchtree'))
const birchTree = new BirchTree(birchTreeReffs)
// experience.addEntity(birchTree);

const objects = [
  grass,
  ground,
  sky,
  fountain,
  birchTree,
  stones,
  lotusflower,
  lotusleaves,
  water,
  waterfall,
  tallgrass
]

experience.addEntity(objects)

const loader = new ResourcesLoader(resources)
loader.on('finish:loaded', () => {
  experience.init(loader.resources);
  window.experience = experience;
  loading.finish()
  // register Debugger
  // if (debug.active) {
  experience.registerDebugger()

  // }
})

