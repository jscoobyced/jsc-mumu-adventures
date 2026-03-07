import { beforeEach, describe, expect, it, vi } from 'vitest'
import ActiveNpc from '../classes/ActiveNpc'
import { CollisionBlock } from '../classes/CollisionBlock'
import { Heart } from '../classes/Heart'
import { InteractiveNpc } from '../classes/InteractiveNpc'
import { Player } from '../classes/Player'
import SimpleNpc from '../classes/SimpleNpc'
import {
  CurrentStatusData,
  defaultStatusData,
} from '../models/CurrentStatusData'
import { Keys } from '../models/Keys'
import * as eventListeners from './eventListeners'
import { Game, handleNpcs, startGame } from './game'
import * as storage from './storage'
import * as window from './window'

vi.mock('../config.json', () => ({
  default: {
    tileSize: 16,
    cols: 50,
    rows: 50,
    canvasWidth: 1024,
    images: {
      player: {
        princess: './princess.png',
      },
      decorations: {
        heart: './heart.png',
      },
      ui: {
        banner: {
          path: './banner.png',
          width: 1024,
          height: 340,
        },
      },
    },
  },
}))

vi.mock('../sprites', () => ({
  characterSprites: {
    walkDown: { x: 0, y: 0, width: 16, height: 16, frameCount: 4 },
    walkUp: { x: 0, y: 16, width: 16, height: 16, frameCount: 4 },
    walkLeft: { x: 0, y: 32, width: 16, height: 16, frameCount: 4 },
    walkRight: { x: 0, y: 48, width: 16, height: 16, frameCount: 4 },
  },
}))

vi.mock('../levels', () => ({
  defaultLevel: {
    name: 'A-1',
    layersData: {},
    frontRenderedLayersData: {},
    tilesets: {},
    l_Collisions: [],
    npcs: [],
    npcConfiguration: [],
  },
  levelConfig: [
    {
      level: {
        name: 'A-1',
        layersData: {},
        frontRenderedLayersData: {},
        tilesets: {},
        l_Collisions: [],
        npcs: [],
        npcConfiguration: [],
      },
    },
  ],
}))

vi.mock('../level', () => ({
  startRendering: vi.fn(),
}))

vi.mock('../utils/loadImage', () => ({
  loadImage: vi.fn((src: string) =>
    Promise.resolve(Object.assign(new Image(), { src })),
  ),
}))

vi.mock('./log', () => ({
  jscLog: vi.fn(),
}))

vi.mock('./storage', () => ({
  setCurrentStatus: vi.fn(),
}))

describe('game', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('startGame', () => {
    it('should create game with default status when restart is true', async () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const { startRendering } = await import('../level')
      const mockStartRendering = startRendering as ReturnType<typeof vi.fn>

      startGame(true)

      expect(mockStartRendering).toHaveBeenCalled()
      const game = mockStartRendering.mock.calls[0][0]
      expect(game.playing).toBe(true)
      expect(game.paused).toBe(false)
    })

    it('should create game with stored status when available', async () => {
      const mockStatus: CurrentStatusData = {
        version: 1,
        currentLevel: 'A-1',
        health: 2,
        playerData: {
          position: { x: 100, y: 200 },
          inventory: [],
        },
        levelsData: [],
      }

      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: mockStatus,
      } as never)

      const { startRendering } = await import('../level')

      startGame(false)

      expect(startRendering).toHaveBeenCalled()
      const game = (startRendering as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(game.player.position.x).toBe(100)
      expect(game.player.position.y).toBe(200)
    })

    it('should create player at correct position', async () => {
      const mockStatus: CurrentStatusData = {
        ...defaultStatusData,
        playerData: {
          position: { x: 150, y: 250 },
          inventory: [],
        },
      }

      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: mockStatus,
      } as never)

      const { startRendering } = await import('../level')

      startGame(false)

      const game = (startRendering as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(game.player.position.x).toBe(150)
      expect(game.player.position.y).toBe(250)
    })

    it('should create hearts based on health', async () => {
      const mockStatus: CurrentStatusData = {
        ...defaultStatusData,
        health: 2,
      }

      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: mockStatus,
      } as never)

      const { startRendering } = await import('../level')

      startGame(false)

      const game = (startRendering as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(game.hearts).toHaveLength(3)
      expect(game.hearts[0].currentFrame).toBe(4) // Filled
      expect(game.hearts[1].currentFrame).toBe(4) // Filled
      expect(game.hearts[2].currentFrame).toBe(0) // Empty
    })

    it('should create empty hearts when health is 0', async () => {
      const mockStatus: CurrentStatusData = {
        ...defaultStatusData,
        health: 0,
      }

      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: mockStatus,
      } as never)

      const { startRendering } = await import('../level')

      startGame(false)

      const game = (startRendering as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(game.hearts[0].currentFrame).toBe(0)
      expect(game.hearts[1].currentFrame).toBe(0)
      expect(game.hearts[2].currentFrame).toBe(0)
    })

    it('should create game with banner', async () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: defaultStatusData,
      } as never)

      const { startRendering } = await import('../level')

      startGame(false)

      const game = (startRendering as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(game.banner).toBeDefined()
    })

    it('should set game playing to true', async () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: defaultStatusData,
      } as never)

      const { startRendering } = await import('../level')

      startGame(false)

      const game = (startRendering as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(game.playing).toBe(true)
    })

    it('should set game paused to false', async () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: defaultStatusData,
      } as never)

      const { startRendering } = await import('../level')

      startGame(false)

      const game = (startRendering as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(game.paused).toBe(false)
    })

    it('should use default level when version mismatch', async () => {
      const mockStatus: CurrentStatusData = {
        ...defaultStatusData,
        version: 999,
      }

      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: mockStatus,
      } as never)

      const { startRendering } = await import('../level')

      startGame(false)

      const game = (startRendering as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(game.levelData.name).toBe('A-1')
    })
  })

  describe('handleNpcs', () => {
    let mockGame: Game
    let mockKeys: Keys
    let mockContext: CanvasRenderingContext2D
    let mockCollisionBlocks: CollisionBlock[]

    beforeEach(() => {
      vi.spyOn(eventListeners, 'getLastTime').mockReturnValue(1000)
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: {
          levelsData: [],
        },
      } as never)

      mockContext = {
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
      } as unknown as CanvasRenderingContext2D

      mockKeys = {
        w: { pressed: false },
        a: { pressed: false },
        s: { pressed: false },
        d: { pressed: false },
        q: { pressed: false },
        space: { pressed: false },
        spaceEnabled: false,
      }

      mockCollisionBlocks = []

      const mockPlayer = new Player({
        position: { x: 100, y: 100 },
        size: 15,
        imageSrc: './player.png',
        health: 3,
        velocity: { x: 0, y: 0 },
        sprites: {} as never,
      })

      mockGame = {
        playing: true,
        paused: false,
        levelData: {
          name: 'A-1',
          npcs: [],
          layersData: {},
          frontRenderedLayersData: {},
          tilesets: {},
          l_Collisions: [],
          npcConfiguration: [],
        },
        player: mockPlayer,
        hearts: [
          new Heart({ x: 10, y: 10 }, 20, 4),
          new Heart({ x: 32, y: 10 }, 20, 4),
          new Heart({ x: 54, y: 10 }, 20, 4),
        ],
        banner: {
          show: vi.fn(),
        } as never,
      }
    })

    it('should handle empty npc array', () => {
      expect(() =>
        handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys),
      ).not.toThrow()
    })

    it('should update npcs when game is not paused', () => {
      const mockNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 500, y: 500 },
        width: 15,
        height: 15,
        isInvincible: false,
      } as unknown as SimpleNpc

      mockGame.levelData.npcs.push(mockNpc)
      mockGame.paused = false

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(mockNpc.update).toHaveBeenCalled()
    })

    it('should not update npcs when game is paused', () => {
      const mockNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 500, y: 500 },
        width: 15,
        height: 15,
        isInvincible: false,
      } as unknown as SimpleNpc

      mockGame.levelData.npcs.push(mockNpc)
      mockGame.paused = true

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(mockNpc.update).not.toHaveBeenCalled()
    })

    it('should always draw npcs', () => {
      const mockNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 500, y: 500 },
        width: 15,
        height: 15,
        isInvincible: false,
      } as unknown as SimpleNpc

      mockGame.levelData.npcs.push(mockNpc)

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(mockNpc.draw).toHaveBeenCalledWith(mockContext)
    })

    it('should handle collision with InteractiveNpc with messages', () => {
      const mockInteractiveNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 100, y: 100 },
        width: 15,
        height: 15,
        isInvincible: false,
        expectingObjectName: vi.fn(() => null),
        getMessages: vi.fn(() => ['Hello', 'World']),
        setInvincible: vi.fn(),
        getPortraitImageSrc: vi.fn(() => './portrait.png'),
      }

      Object.setPrototypeOf(mockInteractiveNpc, InteractiveNpc.prototype)

      mockGame.levelData.npcs.push(mockInteractiveNpc as never)
      mockGame.player.position = { x: 100, y: 100 }

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(mockGame.paused).toBe(true)
      expect(mockKeys.spaceEnabled).toBe(true)
      expect(mockGame.banner.show).toHaveBeenCalledWith(
        ['Hello', 'World'],
        './portrait.png',
      )
    })

    it('should handle InteractiveNpc expecting object player has', () => {
      const mockInteractiveNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 100, y: 100 },
        width: 15,
        height: 15,
        isInvincible: false,
        expectingObjectName: vi.fn(() => 'key'),
        getMessages: vi.fn(() => []),
        receiveObjectFromPlayer: vi.fn(() => true),
      }

      Object.setPrototypeOf(mockInteractiveNpc, InteractiveNpc.prototype)

      mockGame.levelData.npcs.push(mockInteractiveNpc as never)
      mockGame.player.position = { x: 100, y: 100 }
      vi.spyOn(mockGame.player, 'hasObject').mockReturnValue(true)
      vi.spyOn(mockGame.player, 'getObject').mockReturnValue('key')
      const removeObjectSpy = vi
        .spyOn(mockGame.player, 'removeObject')
        .mockImplementation(() => {})

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(removeObjectSpy).toHaveBeenCalledWith('key')
    })

    it('should handle InteractiveNpc expecting object player does not have', () => {
      const mockInteractiveNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 100, y: 100 },
        width: 15,
        height: 15,
        isInvincible: false,
        expectingObjectName: vi.fn(() => 'key'),
        getMessages: vi.fn(() => []),
        receiveObjectFromPlayer: vi.fn(),
      }

      Object.setPrototypeOf(mockInteractiveNpc, InteractiveNpc.prototype)

      mockGame.levelData.npcs.push(mockInteractiveNpc as never)
      mockGame.player.position = { x: 100, y: 100 }
      vi.spyOn(mockGame.player, 'hasObject').mockReturnValue(false)

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(mockInteractiveNpc.receiveObjectFromPlayer).not.toHaveBeenCalled()
    })

    it('should handle ActiveNpc attacking player', () => {
      const mockActiveNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 100, y: 100 },
        width: 15,
        height: 15,
        isInvincible: false,
        isAttacking: vi.fn(() => true),
      }

      Object.setPrototypeOf(mockActiveNpc, ActiveNpc.prototype)

      mockGame.levelData.npcs.push(mockActiveNpc as never)
      mockGame.player.position = { x: 100, y: 100 }
      mockGame.player.isInvincible = false

      const hitReceivedSpy = vi
        .spyOn(mockGame.player, 'hitReceived')
        .mockImplementation(() => {})

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(hitReceivedSpy).toHaveBeenCalled()
      expect(mockGame.hearts[2].currentFrame).toBe(0)
    })

    it('should show game over when health reaches zero', () => {
      const mockActiveNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 100, y: 100 },
        width: 15,
        height: 15,
        isInvincible: false,
        isAttacking: vi.fn(() => true),
      }

      Object.setPrototypeOf(mockActiveNpc, ActiveNpc.prototype)

      mockGame.levelData.npcs.push(mockActiveNpc as never)
      mockGame.player.position = { x: 100, y: 100 }
      mockGame.player.isInvincible = false
      mockGame.hearts[0].currentFrame = 4
      mockGame.hearts[1].currentFrame = 0
      mockGame.hearts[2].currentFrame = 0

      vi.spyOn(mockGame.player, 'hitReceived').mockImplementation(() => {})

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(mockGame.playing).toBe(false)
      expect(mockKeys.spaceEnabled).toBe(true)
      expect(mockGame.banner.show).toHaveBeenCalledWith([
        'Game over. Press SPACE to restart.',
      ])
    })

    it('should not damage player if player is invincible', () => {
      const mockActiveNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 100, y: 100 },
        width: 15,
        height: 15,
        isInvincible: false,
        isAttacking: vi.fn(() => true),
      }

      Object.setPrototypeOf(mockActiveNpc, ActiveNpc.prototype)

      mockGame.levelData.npcs.push(mockActiveNpc as never)
      mockGame.player.position = { x: 100, y: 100 }
      mockGame.player.isInvincible = true

      const hitReceivedSpy = vi
        .spyOn(mockGame.player, 'hitReceived')
        .mockImplementation(() => {})

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(hitReceivedSpy).not.toHaveBeenCalled()
    })

    it('should not damage player if NPC is not attacking', () => {
      const mockActiveNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 100, y: 100 },
        width: 15,
        height: 15,
        isInvincible: false,
        isAttacking: vi.fn(() => false),
      }

      Object.setPrototypeOf(mockActiveNpc, ActiveNpc.prototype)

      mockGame.levelData.npcs.push(mockActiveNpc as never)
      mockGame.player.position = { x: 100, y: 100 }
      mockGame.player.isInvincible = false

      const hitReceivedSpy = vi
        .spyOn(mockGame.player, 'hitReceived')
        .mockImplementation(() => {})

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(hitReceivedSpy).not.toHaveBeenCalled()
    })

    it('should save current status periodically', () => {
      vi.spyOn(eventListeners, 'getLastTime').mockReturnValue(2500)

      const mockNpc = {
        update: vi.fn(),
        draw: vi.fn(),
        position: { x: 500, y: 500 },
        width: 15,
        height: 15,
        isInvincible: false,
        getCurrentNpcData: vi.fn(() => ({
          npcName: 'test',
          interaction: 0,
        })),
      } as unknown as SimpleNpc

      mockGame.levelData.npcs.push(mockNpc)

      handleNpcs(mockGame, mockContext, mockCollisionBlocks, 16, mockKeys)

      expect(storage.setCurrentStatus).toHaveBeenCalled()
    })
  })
})
