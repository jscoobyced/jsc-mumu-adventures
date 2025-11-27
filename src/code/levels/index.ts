import { LevelConfig, LevelDirection } from "../models/LevelData";
import { levelData as levelA1 } from "./A/1/index";
import { levelData as levelA2 } from "./A/2/index";

export const mapConfig: LevelConfig[] = [
  { levelName: levelA1.name, connectedLevels: [{ direction: LevelDirection.RIGHT, level: levelA2 }] },

  { levelName: levelA2.name, connectedLevels: [{ direction: LevelDirection.LEFT, level: levelA1 }] },
];
