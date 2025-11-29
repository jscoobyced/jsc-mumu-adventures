import { Player } from "./classes/Player";
import { Heart } from "./classes/Heart";
import { initializeEventListeners } from "./utils/eventListeners";
import { startRendering } from "./level";
import config from "./config.json";
import { levelData as LevelA1 } from "./levels/A/1/index";

const player: Player = new Player({
  x: 100,
  y: 400,
  size: 15,
  imageSrc: config.images.player.princess,
});

const hearts: Heart[] = [
  new Heart({
    x: 10,
    y: 10,
  }),
  new Heart({
    x: 32,
    y: 10,
  }),
  new Heart({
    x: 54,
    y: 10,
  }),
];

initializeEventListeners();
startRendering(LevelA1, player, hearts);
