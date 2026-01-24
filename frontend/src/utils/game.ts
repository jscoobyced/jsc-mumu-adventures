import ActiveNpc from '../classes/ActiveNpc'
import { Banner } from '../classes/Banner'
import { CollisionBlock } from '../classes/CollisionBlock'
import { Heart } from '../classes/Heart'
import { InteractiveNpc } from '../classes/InteractiveNpc'
import { Player } from '../classes/Player'
import { SimpleNpc } from '../classes/SimpleNpc'
import config from '../config.json'
import { startRendering } from '../level'
import { defaultLevel, levelConfig } from '../levels'
import { Keys } from '../models'
import {
  CURRENT_STATUS_VERSION,
  CurrentStatusData,
  defaultStatusData,
} from '../models/CurrentStatusData'
import { LevelData } from '../models/LevelData'
import { characterSprites } from '../sprites'
import { getLastTime } from './eventListeners'
import { jscLog } from './log'
import { setCurrentStatus } from './storage'
import { getJscData } from './window'

export interface Game {
  playing: boolean
  paused: boolean
  levelData: LevelData
  player: Player
  hearts: Heart[]
  banner: Banner
}

export const startGame = (restart = false): void => {
  const currentStatusData = restart
    ? defaultStatusData
    : getJscData().currentStatusData || defaultStatusData
  const initialPlayer: Player = new Player(
    {
      position: currentStatusData.playerData.position,
      size: 15,
      imageSrc: config.images.player.princess,
      health: currentStatusData.health,
      velocity: { x: 0, y: 0 },
      sprites: characterSprites,
    },
    currentStatusData.playerData.inventory,
  )

  const heartPosition = 10
  const heartSize = 20
  const initialHearts: Heart[] = [
    new Heart(
      {
        x: heartPosition,
        y: heartPosition,
      },
      heartSize,
      currentStatusData.health > 0 ? 4 : 0,
    ),
    new Heart(
      {
        x: heartPosition + heartSize + 2,
        y: heartPosition,
      },
      heartSize,
      currentStatusData.health > 1 ? 4 : 0,
    ),
    new Heart(
      {
        x: heartPosition + (heartSize + 2) * 2,
        y: heartPosition,
      },
      heartSize,
      currentStatusData.health > 2 ? 4 : 0,
    ),
  ]
  const initialLevel =
    levelConfig.find((config) => config.level.name === currentStatusData.level)!
      .level || defaultLevel

  const game: Game = {
    playing: true,
    paused: false,
    levelData: initialLevel,
    player: initialPlayer,
    hearts: initialHearts,
    banner: new Banner({ x: 10, y: 10 }),
  }
  startRendering(game)
}

let lastSaveTime = 0

export const handleNpcs = (
  game: Game,
  canvas: CanvasRenderingContext2D,
  collisionBlocks: CollisionBlock[],
  deltaTime: number,
  keys: Keys,
): void => {
  for (let i = game.levelData.npcs.length - 1; i >= 0; i--) {
    const npc: SimpleNpc = game.levelData.npcs[i]
    if (!game.paused) npc.update(deltaTime, collisionBlocks)
    npc.draw(canvas)

    // Detect for collision
    if (
      game.player.position.x + game.player.width >= npc.position.x &&
      game.player.position.x <= npc.position.x + npc.width &&
      game.player.position.y + game.player.height >= npc.position.y &&
      game.player.position.y <= npc.position.y + npc.height
    ) {
      if (!npc.isInvincible) {
        if (npc instanceof InteractiveNpc) {
          const interactiveNpc = npc as unknown as InteractiveNpc
          // Check if NPC is expecting an object
          const expectedObject = interactiveNpc.expectingObjectName()
          jscLog(`NPC is expecting a ${expectedObject}`)
          if (expectedObject) {
            // If the NPC is expecting an object, check if player has it
            if (game.player.hasObject(expectedObject)) {
              if (
                interactiveNpc.receiveObjectFromPlayer(
                  game.player.getObject(expectedObject)!,
                )
              ) {
                game.player.removeObject(expectedObject)
              }
            }
          }

          // If the NPC has a message, show it in the banner
          const npcMessages = interactiveNpc.getMessages()
          if (npcMessages?.length > 0) {
            game.paused = true
            interactiveNpc.setHasSpoken()
            keys.spaceEnabled = true
            game.banner.show(npcMessages, interactiveNpc.getPortraitImageSrc())
            continue
          }
        }
        if (npc instanceof ActiveNpc) {
          const activeNpc = npc as unknown as ActiveNpc

          // If the NPC is attacking and player is not invincible
          if (!game.player.isInvincible && activeNpc.isAttacking?.()) {
            game.player.hitReceived()
            const filledHearts: Heart[] = game.hearts.filter(
              (heart: Heart) => heart.currentFrame === 4,
            )

            if (filledHearts.length > 0) {
              filledHearts[filledHearts.length - 1].currentFrame = 0
            }

            if (filledHearts.length <= 1) {
              keys.spaceEnabled = true
              game.banner.show(['Game over. Press SPACE to restart.'])
              game.playing = false
            }
          }
        }
      }
    }

    // Save current status asynchronously every 5 seconds
    if (getLastTime() - lastSaveTime > 1000) {
      const playerData = game.player.getCurrentPlayerData()
      const currentStatusData: CurrentStatusData = {
        version: CURRENT_STATUS_VERSION,
        level: game.levelData.name,
        health: game.hearts.filter((heart: Heart) => heart.currentFrame === 4)
          .length,
        playerData: playerData,
      }
      lastSaveTime = getLastTime()
      setCurrentStatus(currentStatusData)
    }
  }
}
