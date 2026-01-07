import { l_Collisions } from "./l_Collisions";
import { l_Terrain } from "./l_Terrain";
import { l_Trees } from "./l_Trees";
import { l_Houses } from "./l_Houses";
import { l_FrontRenderer } from "./l_FrontRenderer";
import { l_Walls } from "./l_Walls";
import { LayersData } from "../../../models/Layer";
import { LevelData } from "../../../models/LevelData";
import { Tilesets } from "../../../models/TileSet";
import { Monster } from "../../../classes/Monster";
import config from "../../../config.json";
import { characterSprites } from "../../../sprites";

const layersData: LayersData = {
  l_Terrain: l_Terrain,
  l_Trees: l_Trees,
  l_Houses: l_Houses,
  l_Walls: l_Walls,
};

const frontRenderedLayersData: LayersData = {
  l_FrontRenderer: l_FrontRenderer,
};

const tilesets: Tilesets = {
  l_Terrain: {
    imageUrl: config.images.tilesets.terrain,
    tileSize: config.tileSize,
  },
  l_Trees: {
    imageUrl: config.images.tilesets.decorations,
    tileSize: config.tileSize,
  },
  l_Houses: {
    imageUrl: config.images.tilesets.decorations,
    tileSize: config.tileSize,
  },
  l_FrontRenderer: {
    imageUrl: config.images.tilesets.decorations,
    tileSize: config.tileSize,
  },
  l_Walls: {
    imageUrl: config.images.tilesets.decorations,
    tileSize: config.tileSize,
  },
};

const monsters: Monster[] = [
  new Monster({
    x: 380,
    y: 480,
    size: 15,
    velocity: { x: 0, y: 0 },
    imageSrc: config.images.monsters.blond,
    sprites: characterSprites,
  }),
];

export const levelData: LevelData = {
  name: "Level A2",
  layersData,
  frontRenderedLayersData,
  tilesets,
  l_Collisions,
  monsters,
};
