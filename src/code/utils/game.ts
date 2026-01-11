import { Banner } from '../classes/Banner'
import { CollisionBlock } from '../classes/CollisionBlock'
import { Heart } from '../classes/Heart'
import { Npc } from '../classes/Npc'
import { Player } from '../classes/Player'
import config from '../config.json'
import { startRendering } from '../level'
import { levelData as initialLevel } from '../levels/A/1/index'
import { LevelData } from '../models/LevelData'
import { jscLog } from './log'

export interface Game {
  playing: boolean
  paused: boolean
  levelData: LevelData
  player: Player
  hearts: Heart[]
  banner: Banner
}

export const startGame = (): void => {
  const initialHearts: Heart[] = [
    new Heart({
      x: 10,
      y: 10,
    }),
    new Heart({
      x: 32,
      y: 10,
    }),
    new Heart({
      x: 54,
      y: 10,
    }),
  ]

  const initialPlayer: Player = new Player({
    position: { x: 200, y: 550 },
    size: 15,
    imageSrc: config.images.player.princess,
  })

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

export const handleNpcs = (
  game: Game,
  canvas: CanvasRenderingContext2D,
  collisionBlocks: CollisionBlock[],
  deltaTime: number,
): void => {
  for (let i = game.levelData.npcs.length - 1; i >= 0; i--) {
    const npc: Npc = game.levelData.npcs[i]
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
        // Check if NPC is expecting an object
        const expectedObject = npc.expectingObjectName()
        jscLog(`NPC is expecting a ${expectedObject}`)
        if (expectedObject) {
          // If the NPC is expecting an object, check if player has it
          if (game.player.hasObject(expectedObject)) {
            if (
              npc.receiveObjectFromPlayer(
                game.player.getObject(expectedObject)!,
              )
            ) {
              game.player.removeObject(expectedObject)
            }
          }
        }

        // If the NPC has a message, show it in the banner
        const npcMessage = npc.getMessage?.()
        if (npcMessage) {
          game.paused = true
          npc.setInvincible()
          game.banner.show(npcMessage)
          continue
        }

        // If the NPC is attacking and player is not invincible
        if (!game.player.isInvincible && npc.isAttacking?.()) {
          game.player.hitReceived()
          const filledHearts: Heart[] = game.hearts.filter(
            (heart: Heart) => heart.currentFrame === 4,
          )

          if (filledHearts.length > 0) {
            filledHearts[filledHearts.length - 1].currentFrame = 0
          }

          if (filledHearts.length <= 1) {
            game.banner.show('Game over. Press SPACE to restart.')
            game.playing = false
          }
        }
      }
    }
  }
}
