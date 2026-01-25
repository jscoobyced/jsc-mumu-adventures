import { l_Collisions } from "./l_Collisions";
import { l_Terrain } from "./l_Terrain";
import { l_Trees } from "./l_Trees";
import { l_Houses } from "./l_Houses";
import { l_FrontRenderer } from "./l_FrontRenderer";
import { LayersData } from "../../../models/Layer";
import { LevelData } from "../../../models/LevelData";
import { Tilesets } from "../../../models/TileSet";
import config from "../../../config.json";
import level from "./level.json";
import { characterSprites } from "../../../sprites";
import { InteractiveNpc } from "../../../classes/InteractiveNpc";
import { TalkingNpcInitializationOptions } from "../../../models/CharacterInitializationOptions";
import { getJscData } from "../../../utils/window";

const name = "A-1";
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

const npcs: InteractiveNpc[] = [];
const savedLevelData = getJscData().currentStatusData?.levelsData;
const savedNpcs: any[] = [];
if (savedLevelData) {
  const savedLevel = savedLevelData.find((levelData) => levelData.levelName === name);
  if (savedLevel) {
    savedNpcs.push(...savedLevel.npcData);
  }
}

for (const npcData of level.npcs) {
  if (npcData.type === "TalkingNpc") {
    const initializationOptions: TalkingNpcInitializationOptions = {
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: npcData.position.x, y: npcData.position.y },
          size: npcData.size,
          velocity: { x: 0, y: 0 },
          imageSrc: npcData.imageSrc,
          sprites: characterSprites,
          health: npcData.health,
          name: npcData.name,
        },
        attacking: false,
      },
      messages: npcData.messages,
      expectedObject: npcData.expectedObject,
      postObjectMessages: npcData.postObjectMessages,
      waitingMessages: npcData.waitingMessages,
      finalMessages: npcData.finalMessages,
      portraitImageSrc: npcData.portraitImageSrc,
    };
    let savedNpc = savedNpcs.find((npc) => npc.name === npcData.name);

    const newNpc = new InteractiveNpc(initializationOptions, savedNpc?.interaction);
    npcs.push(newNpc);
  }
}

export const levelData: LevelData = {
  name: "A-1",
  layersData,
  frontRenderedLayersData,
  tilesets,
  l_Collisions,
  npcs,
};
