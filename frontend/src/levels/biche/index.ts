import { l_Collisions } from "./l_Collisions";
import { l_Terrain } from "./l_Terrain";
import { l_Trees } from "./l_Trees";
import { l_Houses } from "./l_Houses";
import { l_FrontRenderer } from "./l_FrontRenderer";
import { LayersData } from "../../models/Layer";
import { LevelData } from "../../models/LevelData";
import { Tilesets } from "../../models/TileSet";
import config from "../../config.json";
import level from "./level.json";
import SimpleNpc from "../../classes/SimpleNpc";

const layersData: LayersData = {
  l_Terrain: l_Terrain,
  l_Trees: l_Trees,
  l_Houses: l_Houses,
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
};

const npcs = [] as SimpleNpc[];
export const levelData: LevelData = {
  name: "biche",
  layersData,
  frontRenderedLayersData,
  tilesets,
  l_Collisions,
  npcs,
  npcConfiguration: level.npcs,
};
