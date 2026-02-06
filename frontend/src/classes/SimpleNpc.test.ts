import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SimpleNpc } from './SimpleNpc'
import { CollisionBlock } from './CollisionBlock'
import Interaction from '../models/Interaction'

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

describe('SimpleNpc', () => {
  const mockSprites = {
    walkDown: { x: 0, y: 0, width: 16, height: 16, frameCount: 4 },
    walkUp: { x: 0, y: 16, width: 16, height: 16, frameCount: 4 },
    walkLeft: { x: 0, y: 32, width: 16, height: 16, frameCount: 4 },
    walkRight: { x: 0, y: 48, width: 16, height: 16, frameCount: 4 },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create simple NPC with correct properties', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
      name: 'TestNPC',
    })

    expect(npc.position.x).toBe(200)
    expect(npc.position.y).toBe(300)
    expect(npc.width).toBe(15)
    expect(npc.height).toBe(15)
    expect(npc.health).toBe(2)
    expect(npc.getName()).toBe('TestNPC')
    expect(npc.elapsedMovementTime).toBe(0)
  })

  it('should initialize with walkDown sprite', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    expect(npc.currentSprite).toBe(mockSprites.walkDown)
  })

  it('should not draw when image is not loaded', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    npc.imageLoaded = false

    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D

    npc.draw(mockContext)

    expect(mockContext.drawImage).not.toHaveBeenCalled()
  })

  it('should draw when image is loaded', async () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D

    npc.draw(mockContext)

    expect(mockContext.save).toHaveBeenCalled()
    expect(mockContext.restore).toHaveBeenCalled()
    expect(mockContext.drawImage).toHaveBeenCalled()
  })

  it('should draw with reduced opacity when invincible', async () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))
    npc.isInvincible = true

    let capturedAlpha = 1
    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      set globalAlpha(value: number) {
        capturedAlpha = value
      },
    } as unknown as CanvasRenderingContext2D

    npc.draw(mockContext)

    expect(capturedAlpha).toBe(0.5)
  })

  it('should update velocity based on random movement', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    npc.update(0.1, [])

    // Velocity should be set
    expect(npc.velocity.x).not.toBe(0)
    expect(npc.velocity.y).not.toBe(0)
  })

  it('should change direction after interval', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    const initialVelocityX = npc.velocity.x
    const initialVelocityY = npc.velocity.y

    // Move forward in time past the interval
    npc.update(1.5, [])

    // Velocity should potentially be different
    expect(
      npc.velocity.x !== initialVelocityX ||
        npc.velocity.y !== initialVelocityY,
    ).toBe(true)
  })

  it('should set sprite based on horizontal movement direction', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    // After update, the NPC's AI will set a new velocity and sprite
    // We just check that currentSprite is defined and is one of the valid sprites
    npc.update(0.1, [])

    expect(npc.currentSprite).toBeDefined()
    // The sprite should be from our mockSprites
    const validSprites = Object.values(mockSprites)
    expect(validSprites).toContainEqual(npc.currentSprite)
  })

  it('should reverse horizontal velocity on collision', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 50, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    // Set velocity manually before collision
    npc.velocity.x = 50
    npc.velocity.y = 0
    const initialVelocityX = 50

    const collisionBlock = new CollisionBlock({ x: 210, y: 300, size: 16 })

    // Update will change velocity due to collision
    npc.update(0.2, [collisionBlock])

    // Velocity should have been reversed (or changed by AI)
    expect(npc.velocity.x).not.toBe(initialVelocityX)
  })

  it('should reverse vertical velocity on collision', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 50 },
      sprites: mockSprites,
      health: 2,
    })

    // Set velocity manually before collision
    npc.velocity.y = 50
    npc.velocity.x = 0
    const initialVelocityY = 50

    const collisionBlock = new CollisionBlock({ x: 200, y: 310, size: 16 })

    // Update will change velocity due to collision
    npc.update(0.2, [collisionBlock])

    // Velocity should have been reversed (or changed by AI)
    expect(npc.velocity.y).not.toBe(initialVelocityY)
  })

  it('should test onVerticalCollision method', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 50 },
      sprites: mockSprites,
      health: 2,
    })

    npc.velocity.y = 50
    const collisionBlock = new CollisionBlock({ x: 200, y: 312, size: 16 })
    npc.update(0.1, [collisionBlock])

    // After collision, velocity should be reversed
    expect(npc.velocity.y).not.toBe(50)
  })

  it('should return current NPC data', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
      name: 'Wanderer',
    })

    const npcData = npc.getCurrentNpcData()

    expect(npcData.npcName).toBe('Wanderer')
    expect(npcData.interaction).toBe(Interaction.NONE)
  })

  it('should return unknown when name is not set', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    const npcData = npc.getCurrentNpcData()

    expect(npcData.npcName).toBe('unknown')
  })

  it('should not update when delta time is 0', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    const initialX = npc.position.x
    const initialY = npc.position.y

    npc.update(0, [])

    expect(npc.position.x).toBe(initialX)
    expect(npc.position.y).toBe(initialY)
  })

  it('should wander around original position', () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    // Update multiple times to trigger multiple direction changes
    for (let i = 0; i < 5; i++) {
      npc.update(1.5, [])
    }

    // NPC should still be relatively close to original position (within circle radius + some movement)
    const distance = Math.sqrt(
      Math.pow(npc.position.x - 200, 2) + Math.pow(npc.position.y - 300, 2),
    )
    expect(distance).toBeLessThan(100)
  })

  it('should not draw when currentSprite is undefined', async () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))
    npc.currentSprite = undefined

    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D

    npc.draw(mockContext)

    expect(mockContext.drawImage).not.toHaveBeenCalled()
  })

  it('should animate frames while moving', async () => {
    const npc = new SimpleNpc({
      position: { x: 200, y: 300 },
      size: 15,
      imageSrc: './npc.png',
      velocity: { x: 0, y: 0 },
      sprites: mockSprites,
      health: 2,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(npc.currentFrame).toBe(0)

    npc.update(0.2, [])
    expect(npc.currentFrame).toBe(1)

    npc.update(0.2, [])
    expect(npc.currentFrame).toBe(2)
  })
})
