import { LevelConfig, LevelDirection } from "../models/LevelData";
import { levelData as levelA1 } from "./A/1/index";
import { levelData as levelA2 } from "./A/2/index";

export const levelConfig: LevelConfig[] = [
  { level: levelA1, connectedLevels: [{ direction: LevelDirection.RIGHT, level: levelA2 }] },
  { level: levelA2, connectedLevels: [{ direction: LevelDirection.LEFT, level: levelA1 }] },
];

export const defaultLevel = levelA1;
