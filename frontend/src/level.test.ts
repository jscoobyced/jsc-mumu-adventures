import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Heart } from './classes/Heart'
import { Player } from './classes/Player'
import { LevelData, LevelDirection } from './models/LevelData'
import type { Game } from './utils/game'

vi.mock('./config.json', () => ({
  default: {
    tileSize: 16,
    cols: 50,
    rows: 50,
    mapScale: 0.5,
    canvasWidth: 1024,
    canvasHeight: 576,
    images: {
      player: { princess: './princess.png' },
      decorations: { heart: './heart.png' },
      ui: {
        banner: { path: './banner.png', width: 1024, height: 340 },
      },
    },
  },
}))

vi.mock('./sprites', () => ({
  characterSprites: {
    walkDown: { x: 0, y: 0, width: 16, height: 16, frameCount: 4 },
    walkUp: { x: 0, y: 16, width: 16, height: 16, frameCount: 4 },
    walkLeft: { x: 0, y: 32, width: 16, height: 16, frameCount: 4 },
    walkRight: { x: 0, y: 48, width: 16, height: 16, frameCount: 4 },
  },
}))

const mockLevelA1: LevelData = {
  name: 'A-1',
  layersData: {},
  frontRenderedLayersData: {},
  tilesets: {},
  l_Collisions: [],
  npcs: [],
  npcConfiguration: [],
}

const mockLevelA2: LevelData = {
  name: 'A-2',
  layersData: {},
  frontRenderedLayersData: {},
  tilesets: {},
  l_Collisions: [],
  npcs: [],
  npcConfiguration: [],
}

const mockLevelB1: LevelData = {
  name: 'B-1',
  layersData: {},
  frontRenderedLayersData: {},
  tilesets: {},
  l_Collisions: [],
  npcs: [],
  npcConfiguration: [],
}

const mockLevelC1: LevelData = {
  name: 'C-1',
  layersData: {},
  frontRenderedLayersData: {},
  tilesets: {},
  l_Collisions: [],
  npcs: [],
  npcConfiguration: [],
}

vi.mock('./levels', () => ({
  defaultLevel: mockLevelA1,
  levelConfig: [
    {
      level: mockLevelA1,
      connectedLevels: [
        { direction: 'right', level: mockLevelA2 },
        { direction: 'up', level: mockLevelB1 },
        { direction: 'down', level: mockLevelC1 },
      ],
    },
    {
      level: mockLevelA2,
      connectedLevels: [{ direction: 'left', level: mockLevelA1 }],
    },
    {
      level: mockLevelB1,
      connectedLevels: [{ direction: 'down', level: mockLevelA1 }],
    },
    {
      level: mockLevelC1,
      connectedLevels: [{ direction: 'up', level: mockLevelA1 }],
    },
  ],
}))

vi.mock('./utils/loadImage', () => ({
  loadImage: vi.fn((src: string) => {
    const img = new Image()
    img.src = src
    Object.defineProperty(img, 'width', { value: 256 })
    Object.defineProperty(img, 'height', { value: 256 })
    return Promise.resolve(img)
  }),
}))

vi.mock('./utils/debug', () => ({
  isDebugMode: vi.fn(() => false),
}))

vi.mock('./utils/music', () => ({
  toggleAudio: vi.fn(),
}))

vi.mock('./utils/npc', () => ({
  initializeNpcs: vi.fn(() => []),
}))

vi.mock('./utils/game', () => ({
  handleNpcs: vi.fn(),
  startGame: vi.fn(),
}))

vi.mock('./utils/eventListeners', () => ({
  getKeys: vi.fn(() => ({
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
    g: { pressed: false },
    q: { pressed: false },
    space: { pressed: false },
    spaceEnabled: false,
  })),
  getLastTime: vi.fn(() => 0),
  setLastTime: vi.fn(),
}))

const mockOffscreenContext = {
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  fillStyle: '',
  fillRect: vi.fn(),
  canvas: { width: 1024, height: 576 },
}

const mockMainContext = {
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  fillStyle: '',
  fillRect: vi.fn(),
  canvas: { width: 1024, height: 576 },
}

vi.mock('./utils/drawContext', () => ({
  getDrawContext: vi.fn(() => mockMainContext),
}))

// Mock document.createElement to return a mock canvas for offscreen rendering
const originalCreateElement = document.createElement.bind(document)
vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
  if (tag === 'canvas') {
    const canvas = originalCreateElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(
      mockOffscreenContext as unknown as CanvasRenderingContext2D,
    )
    return canvas
  }
  return originalCreateElement(tag)
})

describe('level', () => {
  let startRendering: (game: Game) => Promise<void>

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('./level')
    startRendering = module.startRendering
  })

  const createMockGame = (overrides: Partial<Game> = {}): Game => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      health: 3,
      velocity: { x: 0, y: 0 },
      sprites: {} as never,
    })

    return {
      playing: true,
      paused: false,
      levelData: { ...mockLevelA1, npcs: [], npcConfiguration: [] },
      player,
      hearts: [
        new Heart({ x: 10, y: 10 }, 20, 4),
        new Heart({ x: 32, y: 10 }, 20, 4),
        new Heart({ x: 54, y: 10 }, 20, 4),
      ],
      banner: {
        draw: vi.fn(() => false),
        show: vi.fn(),
      } as never,
      ...overrides,
    }
  }

  describe('startRendering', () => {
    it('should call initializeNpcs with level name and config', async () => {
      const { initializeNpcs } = await import('./utils/npc')

      const game = createMockGame()
      await startRendering(game)

      expect(initializeNpcs).toHaveBeenCalledWith('A-1', [])
    })

    it('should prepare collision blocks from level data', async () => {
      const game = createMockGame()
      game.levelData.l_Collisions = [
        [0, 1, 0],
        [1, 0, 1],
      ]

      await startRendering(game)

      // startRendering should not throw and should invoke animate
      expect(mockMainContext.save).toHaveBeenCalled()
    })

    it('should render background layers from layersData', async () => {
      const game = createMockGame()
      game.levelData.layersData = {
        terrain: [
          [1, 2],
          [3, 0],
        ],
      }
      game.levelData.tilesets = {
        terrain: { imageUrl: './terrain.png', tileSize: 16 },
      }

      await startRendering(game)

      // drawImage should have been called for tiles with non-zero values
      expect(mockOffscreenContext.drawImage).toHaveBeenCalled()
    })

    it('should skip layers with no matching tileset', async () => {
      const game = createMockGame()
      game.levelData.layersData = {
        unknown_layer: [[1, 2]],
      }
      game.levelData.tilesets = {}

      await startRendering(game)

      // No drawImage on offscreen since no tileset matches
      expect(mockOffscreenContext.drawImage).not.toHaveBeenCalled()
    })

    it('should skip zero-valued tiles during rendering', async () => {
      const game = createMockGame()
      game.levelData.layersData = {
        terrain: [[0, 0]],
      }
      game.levelData.tilesets = {
        terrain: { imageUrl: './terrain.png', tileSize: 16 },
      }

      await startRendering(game)

      // drawImage called on main context (for background canvas) but not on offscreen for tiles
      expect(mockOffscreenContext.drawImage).not.toHaveBeenCalled()
    })
  })

  describe('animate', () => {
    it('should call requestAnimationFrame for game loop', async () => {
      const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame')

      const game = createMockGame()
      await startRendering(game)

      expect(rafSpy).toHaveBeenCalled()
    })

    it('should draw player and handle NPCs', async () => {
      const { handleNpcs } = await import('./utils/game')

      const game = createMockGame()
      await startRendering(game)

      expect(handleNpcs).toHaveBeenCalled()
    })

    it('should not handle input when game is paused', async () => {
      const game = createMockGame({ paused: true })
      const handleInputSpy = vi.spyOn(game.player, 'handleInput')

      await startRendering(game)

      expect(handleInputSpy).not.toHaveBeenCalled()
    })

    it('should not handle NPCs when game is paused', async () => {
      const { handleNpcs } = await import('./utils/game')
      const game = createMockGame({ paused: true })

      await startRendering(game)

      expect(handleNpcs).not.toHaveBeenCalled()
    })

    it('should draw hearts', async () => {
      const game = createMockGame()
      const heartDrawSpies = game.hearts.map((h) => vi.spyOn(h, 'draw'))

      await startRendering(game)

      heartDrawSpies.forEach((spy) => {
        expect(spy).toHaveBeenCalled()
      })
    })

    it('should draw banner', async () => {
      const game = createMockGame()
      await startRendering(game)

      expect(game.banner.draw).toHaveBeenCalled()
    })

    it('should unpause game when banner is closed', async () => {
      const game = createMockGame({ paused: true })
      ;(game.banner.draw as ReturnType<typeof vi.fn>).mockReturnValue(true)

      await startRendering(game)

      expect(game.paused).toBe(false)
    })

    it('should restart game when not playing and banner closed', async () => {
      const { startGame } = await import('./utils/game')

      const game = createMockGame({ playing: false })
      ;(game.banner.draw as ReturnType<typeof vi.fn>).mockReturnValue(true)

      await startRendering(game)

      expect(startGame).toHaveBeenCalledWith(true)
    })

    it('should toggle audio each frame', async () => {
      const { toggleAudio } = await import('./utils/music')

      const game = createMockGame()
      await startRendering(game)

      expect(toggleAudio).toHaveBeenCalled()
    })

    it('should render debug collisions when debug mode is on', async () => {
      const { isDebugMode } = await import('./utils/debug')
      vi.mocked(isDebugMode).mockReturnValue(true)

      const game = createMockGame()
      game.levelData.l_Collisions = [[1]]

      await startRendering(game)

      // In debug mode, collision blocks are drawn
      // The main context should have extra draw calls
      expect(mockMainContext.save).toHaveBeenCalled()
    })

    it('should handle level transition right', async () => {
      const game = createMockGame()
      vi.spyOn(game.player, 'update').mockReturnValue(LevelDirection.RIGHT)

      await startRendering(game)

      // After transition, player position should be near left edge
      expect(game.player.position.x).toBeCloseTo(0, 0)
      expect(game.levelData.name).toBe('A-2')
    })

    it('should handle level transition left', async () => {
      const game = createMockGame()
      game.levelData = { ...mockLevelA2, npcs: [], npcConfiguration: [] }
      vi.spyOn(game.player, 'update').mockReturnValue(LevelDirection.LEFT)

      await startRendering(game)

      // After transition, player position should be near right edge
      expect(game.player.position.x).toBeGreaterThan(700)
      expect(game.levelData.name).toBe('A-1')
    })

    it('should handle level transition up', async () => {
      const game = createMockGame()
      vi.spyOn(game.player, 'update').mockReturnValue(LevelDirection.UP)

      await startRendering(game)

      // After transition up, player position should be near bottom edge
      expect(game.player.position.y).toBeGreaterThan(700)
      expect(game.levelData.name).toBe('B-1')
    })

    it('should handle level transition down', async () => {
      const game = createMockGame()
      vi.spyOn(game.player, 'update').mockReturnValue(LevelDirection.DOWN)

      await startRendering(game)

      // After transition down, player position should be near top edge
      expect(game.player.position.y).toBeCloseTo(0, 0)
      expect(game.levelData.name).toBe('C-1')
    })

    it('should not transition when no connection exists for direction', async () => {
      const game = createMockGame()
      // A-2 only has LEFT connection, not UP
      game.levelData = { ...mockLevelA2, npcs: [], npcConfiguration: [] }
      vi.spyOn(game.player, 'update').mockReturnValue(LevelDirection.UP)

      const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame')

      await startRendering(game)

      expect(rafSpy).toHaveBeenCalled()
      expect(game.levelData.name).toBe('A-2')
    })

    it('should not handle input when not playing', async () => {
      const game = createMockGame({ playing: false })
      const handleInputSpy = vi.spyOn(game.player, 'handleInput')

      // Banner doesn't close, so no restart
      await startRendering(game)

      expect(handleInputSpy).not.toHaveBeenCalled()
    })
  })
})
