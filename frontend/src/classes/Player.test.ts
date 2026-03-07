import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Keys } from '../models'
import { LevelDirection } from '../models/LevelData'
import { Player } from './Player'

vi.mock('../config.json', () => ({
  default: {
    tileSize: 16,
    cols: 50,
    rows: 50,
  },
}))

vi.mock('../utils/loadImage', () => ({
  loadImage: vi.fn((src: string) =>
    Promise.resolve(Object.assign(new Image(), { src })),
  ),
}))

vi.mock('../utils/log', () => ({
  jscLog: vi.fn(),
}))

describe('Player', () => {
  const mockSprites = {
    walkDown: { x: 0, y: 0, width: 16, height: 16, frameCount: 4 },
    walkUp: { x: 0, y: 16, width: 16, height: 16, frameCount: 4 },
    walkLeft: { x: 0, y: 32, width: 16, height: 16, frameCount: 4 },
    walkRight: { x: 0, y: 48, width: 16, height: 16, frameCount: 4 },
  }

  const createMockKeys = (): Keys => ({
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
    q: { pressed: false },
    space: { pressed: false },
    spaceEnabled: false,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create player with default inventory', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    expect(player.position.x).toBe(100)
    expect(player.position.y).toBe(100)
    expect(player.width).toBe(15)
    expect(player.height).toBe(15)
  })

  it('should create player with initial inventory', () => {
    const player = new Player(
      {
        position: { x: 100, y: 100 },
        size: 15,
        imageSrc: './player.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
      ['sword', 'shield'],
    )

    expect(player.hasObject('sword')).toBe(true)
    expect(player.hasObject('shield')).toBe(true)
  })

  it('should move right when D is pressed', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()
    keys.d.pressed = true

    player.handleInput(keys)

    expect(player.velocity.x).toBe(120)
    expect(player.velocity.y).toBe(0)
  })

  it('should move left when A is pressed', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()
    keys.a.pressed = true

    player.handleInput(keys)

    expect(player.velocity.x).toBe(-120)
    expect(player.velocity.y).toBe(0)
  })

  it('should move up when W is pressed', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()
    keys.w.pressed = true

    player.handleInput(keys)

    expect(player.velocity.x).toBe(0)
    expect(player.velocity.y).toBe(-120)
  })

  it('should move down when S is pressed', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()
    keys.s.pressed = true

    player.handleInput(keys)

    expect(player.velocity.x).toBe(0)
    expect(player.velocity.y).toBe(120)
  })

  it('should normalize diagonal movement', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()
    keys.d.pressed = true
    keys.s.pressed = true

    player.handleInput(keys)

    // Should be normalized: 120 * sqrt(2)/2 ≈ 84.85
    expect(player.velocity.x).toBeCloseTo(84.85, 1)
    expect(player.velocity.y).toBeCloseTo(84.85, 1)
  })

  it('should set frame count to 1 when not moving', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()

    player.handleInput(keys)

    expect(player.currentSprite?.frameCount).toBe(1)
  })

  it('should set frame count to 4 when moving', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()
    keys.w.pressed = true

    player.handleInput(keys)

    expect(player.currentSprite?.frameCount).toBe(4)
  })

  it('should add object to inventory when found', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    player.objectFound('key')

    expect(player.hasObject('key')).toBe(true)
  })

  it('should not add duplicate objects to inventory', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    player.objectFound('key')
    player.objectFound('key')

    expect(player.hasObject('key')).toBe(true)
  })

  it('should get object from inventory', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    player.objectFound('sword')

    expect(player.getObject('sword')).toBe('sword')
    expect(player.getObject('shield')).toBe('')
  })

  it('should remove object from inventory', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    player.objectFound('key')
    expect(player.hasObject('key')).toBe(true)

    player.removeObject('key')
    expect(player.hasObject('key')).toBe(false)
  })

  it('should return current player data', () => {
    const player = new Player(
      {
        position: { x: 100, y: 200 },
        size: 15,
        imageSrc: './player.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
      ['sword'],
    )

    const playerData = player.getCurrentPlayerData()

    expect(playerData.position.x).toBe(100)
    expect(playerData.position.y).toBe(200)
    expect(playerData.inventory).toEqual(['sword'])
  })

  it('should update position based on input and delta time', async () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    const keys = createMockKeys()
    keys.d.pressed = true
    player.handleInput(keys)

    player.update(0.1, [])

    expect(player.position.x).toBe(112)
  })

  it('should return NONE when not at map boundary', async () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    const result = player.update(0.1, [])

    expect(result).toBe(LevelDirection.NONE)
  })

  it('should draw player when image is loaded', async () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    player.draw(mockContext)

    expect(mockContext.drawImage).toHaveBeenCalled()
  })

  it('should not draw player when image is not loaded', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    player.imageLoaded = false

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    player.draw(mockContext)

    expect(mockContext.drawImage).not.toHaveBeenCalled()
  })

  it('should not draw when current sprite is undefined', async () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))
    player.currentSprite = undefined

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    player.draw(mockContext)

    expect(mockContext.drawImage).not.toHaveBeenCalled()
  })

  it('should return NONE when delta time is 0', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const result = player.update(0, [])

    expect(result).toBe(LevelDirection.NONE)
  })

  it('should set invincibility interval to 0.8', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    expect(player.invincibilityInterval).toBe(0.8)
  })

  it('should normalize objects to lowercase when found', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    player.objectFound('SWORD')

    expect(player.hasObject('sword')).toBe(true)
  })

  it('should handle multiple key presses', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()
    keys.w.pressed = true
    keys.a.pressed = true

    player.handleInput(keys)

    expect(player.velocity.x).toBeCloseTo(-84.85, 1)
    expect(player.velocity.y).toBeCloseTo(-84.85, 1)
  })

  it('should change sprite based on direction', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    const keys = createMockKeys()

    keys.d.pressed = true
    player.handleInput(keys)
    expect(player.currentSprite).toEqual(mockSprites.walkRight)

    keys.d.pressed = false
    keys.a.pressed = true
    player.handleInput(keys)
    expect(player.currentSprite).toEqual(mockSprites.walkLeft)

    keys.a.pressed = false
    keys.w.pressed = true
    player.handleInput(keys)
    expect(player.currentSprite).toEqual(mockSprites.walkUp)

    keys.w.pressed = false
    keys.s.pressed = true
    player.handleInput(keys)
    expect(player.currentSprite).toEqual(mockSprites.walkDown)
  })

  it('should not handle input when currentSprite is undefined', () => {
    const player = new Player({
      position: { x: 100, y: 100 },
      size: 15,
      imageSrc: './player.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 3,
    })

    player.currentSprite = undefined

    const keys = createMockKeys()
    keys.d.pressed = true

    player.handleInput(keys)

    // velocity should remain 0
    expect(player.velocity.x).toBe(0)
  })
})
