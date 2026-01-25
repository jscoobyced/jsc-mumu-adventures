import Interaction from './Interaction'
import { Vector } from './Vector'

export const CURRENT_STATUS_VERSION = 1

export const defaultStatusData: CurrentStatusData = {
  version: CURRENT_STATUS_VERSION,
  currentLevel: 'A-1',
  levelsData: [],
  health: 3,
  playerData: {
    position: { x: 200, y: 550 },
    inventory: [],
  },
}

export interface CurrentStatusData {
  version: number
  health: number
  playerData: PlayerData
  currentLevel?: string
  levelsData?: SavedLevelData[]
}

export interface PlayerData {
  position: Vector
  inventory: string[]
}

export interface NpcData {
  npcName: string
  interaction: Interaction
}

export interface SavedLevelData {
  levelName: string
  npcData: NpcData[]
}
