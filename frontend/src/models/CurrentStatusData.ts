import { Vector } from './Vector'

export const defaultStatusData: CurrentStatusData = {
  level: 'A-1',
  health: 3,
  playerData: {
    position: { x: 200, y: 550 },
    inventory: [],
  },
}

export interface CurrentStatusData {
  level: string
  health: number
  playerData: PlayerData
}

export interface PlayerData {
  position: Vector
  inventory: string[]
}
