import { Sprites } from "./models";
import config from "./config.json";

export const characterSprites: Sprites = {
  walkDown: {
    x: 0,
    y: 0,
    width: config.tileSize,
    height: config.tileSize,
    frameCount: 4,
  },
  walkUp: {
    x: config.tileSize,
    y: 0,
    width: config.tileSize,
    height: config.tileSize,
    frameCount: 4,
  },
  walkLeft: {
    x: config.tileSize * 2,
    y: 0,
    width: config.tileSize,
    height: config.tileSize,
    frameCount: 4,
  },
  walkRight: {
    x: config.tileSize * 3,
    y: 0,
    width: config.tileSize,
    height: config.tileSize,
    frameCount: 4,
  },
};
