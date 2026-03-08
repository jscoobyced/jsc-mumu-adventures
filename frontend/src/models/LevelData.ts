import { SimpleNpc } from '../classes/SimpleNpc'
import { LayersData } from './Layer'
import { NpcConfiguration } from './NpcConfiguration'
import { Tilesets } from './TileSet'
import { Vector } from './Vector'

export interface LevelData {
  name: string
  layersData: LayersData
  frontRenderedLayersData: LayersData
  tilesets: Tilesets
  l_Collisions: number[][]
  npcs: SimpleNpc[]
  npcConfiguration: NpcConfiguration[]
}

export interface LevelConfig {
  level: LevelData
  connectedLevels?: LevelConnection[]
}

export interface LevelConnection {
  direction: LevelDirection
  position?: {
    to: Vector
    from: Vector
  }
  level: LevelData
}

export enum LevelDirection {
  RIGHT = 'right',
  LEFT = 'left',
  UP = 'up',
  DOWN = 'down',
  POSITION = 'position',
  NONE = 'none',
}
