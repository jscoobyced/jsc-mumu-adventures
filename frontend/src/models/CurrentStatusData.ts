import { Vector } from './Vector'

export const CURRENT_STATUS_VERSION = 1

export const defaultStatusData: CurrentStatusData = {
  version: CURRENT_STATUS_VERSION,
  level: 'A-1',
  health: 3,
  playerData: {
    position: { x: 200, y: 550 },
    inventory: [],
  },
}

export interface CurrentStatusData {
  version: number
  level: string
  health: number
  playerData: PlayerData
}

export interface PlayerData {
  position: Vector
  inventory: string[]
}
