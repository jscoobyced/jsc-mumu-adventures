import { LevelConfig, LevelDirection } from "../models/LevelData";
import { levelData as levelA1 } from "./A/1/index";
import { levelData as levelA2 } from "./A/2/index";
import { levelData as biche } from "./biche/index";

export const levelConfig: LevelConfig[] = [
  { level: levelA1, connectedLevels: [{ direction: LevelDirection.RIGHT, level: levelA2 }] },
  {
    level: levelA2,
    connectedLevels: [
      { direction: LevelDirection.LEFT, level: levelA1 },
      { direction: LevelDirection.POSITION, position: { to: { x: 320, y: 290 }, from: { x: 375, y: 730 } }, level: biche },
    ],
  },
  { level: biche, connectedLevels: [{ direction: LevelDirection.POSITION, position: { to: { x: 375, y: 740 }, from: { x: 320, y: 300 } }, level: levelA2 }] },
];

export const defaultLevel = levelA1;
