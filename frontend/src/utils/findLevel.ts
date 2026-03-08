import { Player } from '../classes/Player'
import { levelConfig } from '../levels'
import { Vector } from '../models'
import { LevelData, LevelDirection } from '../models/LevelData'

const BUFFER = 0.0001
const DOOR_BUFFER = 5

export const findEntrances = (
  playerPosition: Vector,
  level: LevelData,
): LevelData => {
  const nearbyLevels = levelConfig
    .filter((config) => config.level.name === level.name)
    .flatMap(
      (config) =>
        config.connectedLevels?.find(
          (level) => level.direction === LevelDirection.POSITION,
        ) || [],
    )
    .filter((connectedLevels) => {
      const entrance = connectedLevels.position?.to
      return (
        entrance &&
        playerPosition.x > entrance.x - DOOR_BUFFER &&
        playerPosition.x < entrance.x + DOOR_BUFFER &&
        playerPosition.y > entrance.y - DOOR_BUFFER &&
        playerPosition.y < entrance.y + DOOR_BUFFER
      )
    })

  if (nearbyLevels.length > 0) {
    const nearbyLevel = nearbyLevels[0]
    const newLevel = nearbyLevels[0].level // Return the first matching level connection

    playerPosition.x = nearbyLevel.position?.from.x || playerPosition.x
    playerPosition.y = nearbyLevel.position?.from.y || playerPosition.y
    return newLevel
  }
  return undefined as unknown as LevelData
}

export const findOutOfBoundsLevel = (
  levelDirection: LevelDirection,
  levelName: string,
  player: Player,
  mapWidth: number,
  mapHeight: number,
) => {
  // Out of Map bounds
  if (levelDirection !== LevelDirection.NONE) {
    const currentConfig = levelConfig.find(
      (config) => config.level.name === levelName,
    )
    if (currentConfig) {
      const connection = currentConfig.connectedLevels?.find(
        (conn) => conn.direction === levelDirection,
      )
      if (connection) {
        if (levelDirection === LevelDirection.LEFT) {
          player.position.x = mapWidth - player.width - BUFFER
        } else if (levelDirection === LevelDirection.RIGHT) {
          player.position.x = 0 + BUFFER
        } else if (levelDirection === LevelDirection.UP) {
          player.position.y = mapHeight - player.height - BUFFER
        } else if (levelDirection === LevelDirection.DOWN) {
          player.position.y = 0 + BUFFER
        }
        return connection.level
      }
    }
  }
  return undefined as unknown as LevelData
}
