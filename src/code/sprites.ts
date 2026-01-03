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
    x: 0,
    y: config.tileSize,
    width: config.tileSize,
    height: config.tileSize,
    frameCount: 4,
  },
  walkLeft: {
    x: 0,
    y: config.tileSize * 2,
    width: config.tileSize,
    height: config.tileSize,
    frameCount: 4,
  },
  walkRight: {
    x: 0,
    y: config.tileSize * 3,
    width: config.tileSize,
    height: config.tileSize,
    frameCount: 4,
  },
};
