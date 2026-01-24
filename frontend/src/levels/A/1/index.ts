import { l_Collisions } from "./l_Collisions";
import { l_Terrain } from "./l_Terrain";
import { l_Trees } from "./l_Trees";
import { l_Houses } from "./l_Houses";
import { l_FrontRenderer } from "./l_FrontRenderer";
import { LayersData } from "../../../models/Layer";
import { LevelData } from "../../../models/LevelData";
import { Tilesets } from "../../../models/TileSet";
import config from "../../../config.json";
import { characterSprites } from "../../../sprites";
import { InteractiveNpc } from "../../../classes/InteractiveNpc";
import { TalkingNpcInitializationOptions } from "../../../models/CharacterInitializationOptions";

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

const initializationOptions: TalkingNpcInitializationOptions = {
  npcInitializationOptions: {
    characterInitializationOptions: {
      position: { x: 300, y: 480 },
      size: 15,
      velocity: { x: 0, y: 0 },
      imageSrc: config.images.npcs.blond,
      sprites: characterSprites,
      health: 1,
    },
    attacking: false,
  },
  messages: ["Hello there!", "Welcome to our village.", "Do you have the key?"],
  expectedObject: "Key",
  postObjectMessages: ["Thank you for the key!", "You can now enter the castle."],
};

const npcs: InteractiveNpc[] = [new InteractiveNpc(initializationOptions)];

export const levelData: LevelData = {
  name: "A-1",
  layersData,
  frontRenderedLayersData,
  tilesets,
  l_Collisions,
  npcs,
};
