import { Npc } from '../classes/Npc'
import { LayersData } from './Layer'
import { Tilesets } from './TileSet'

export interface LevelData {
  name: string
  layersData: LayersData
  frontRenderedLayersData: LayersData
  tilesets: Tilesets
  l_Collisions: number[][]
  npcs: Npc[]
}

export interface LevelConfig {
  levelName: string
  connectedLevels?: LevelConnection[]
}

export interface LevelConnection {
  direction: LevelDirection
  level: LevelData
}

export enum LevelDirection {
  RIGHT = 'right',
  LEFT = 'left',
  UP = 'up',
  DOWN = 'down',
  NONE = 'none',
}
