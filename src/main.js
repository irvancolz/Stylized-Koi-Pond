import Experience from "./Experience";
import "./style.css";
import World from "./World/World";
import DebugFloor from "./World/DebugFloor";
import Starter from "./World/Starter";
const canvas = document.getElementById("canvas");

const world = new World();
const floor = new DebugFloor();
world.add(floor);

const starter = new Starter();
world.add(starter);

const experience = new Experience(canvas);
experience.setWorld(world);

experience.init();
window.experience = experience;
