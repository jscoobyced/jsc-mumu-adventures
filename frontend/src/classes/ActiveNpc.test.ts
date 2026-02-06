import { describe, expect, it, vi, beforeEach } from 'vitest'
import ActiveNpc from './ActiveNpc'

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

describe('ActiveNpc', () => {
  const mockSprites = {
    walkDown: { x: 0, y: 0, width: 16, height: 16, frameCount: 4 },
    walkUp: { x: 0, y: 16, width: 16, height: 16, frameCount: 4 },
    walkLeft: { x: 0, y: 32, width: 16, height: 16, frameCount: 4 },
    walkRight: { x: 0, y: 48, width: 16, height: 16, frameCount: 4 },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create active NPC with default attacking false', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
        name: 'Enemy',
      },
    })

    expect(npc.position.x).toBe(200)
    expect(npc.position.y).toBe(300)
    expect(npc.health).toBe(3)
    expect(npc.isAttacking()).toBe(false)
  })

  it('should create active NPC with attacking true', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
        name: 'Enemy',
      },
      attacking: true,
    })

    expect(npc.isAttacking()).toBe(true)
  })

  it('should set invincibility interval to 3', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
    })

    expect(npc.invincibilityInterval).toBe(3)
  })

  it('should set elapsed movement time to 0', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
    })

    expect(npc.elapsedMovementTime).toBe(0)
  })

  it('should manually set invincibility', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
    })

    expect(npc.isInvincible).toBe(false)

    npc.setInvincible()

    expect(npc.isInvincible).toBe(true)
  })

  it('should reduce health when hit received', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
    })

    expect(npc.health).toBe(3)

    npc.hitReceived()

    expect(npc.health).toBe(2)
    expect(npc.isInvincible).toBe(true)
  })

  it('should not reduce health when already invincible', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
    })

    npc.setInvincible()
    expect(npc.health).toBe(3)

    npc.hitReceived()

    expect(npc.health).toBe(3)
  })

  it('should reduce health multiple times when not invincible', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
    })

    npc.hitReceived()
    expect(npc.health).toBe(2)

    // Reset invincibility for testing
    npc.isInvincible = false

    npc.hitReceived()
    expect(npc.health).toBe(1)

    npc.isInvincible = false

    npc.hitReceived()
    expect(npc.health).toBe(0)
  })

  it('should inherit health from initialization options', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 5,
      },
    })

    expect(npc.health).toBe(5)
  })

  it('should default to health 3 when not specified', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: undefined as unknown as number,
      },
    })

    expect(npc.health).toBe(3)
  })

  it('should inherit all SimpleNpc behaviors', () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
        name: 'Goblin',
      },
    })

    // Should have SimpleNpc properties
    expect(npc.elapsedMovementTime).toBe(0)
    expect(npc.getName()).toBe('Goblin')

    // Should be able to update
    npc.update(0.1, [])
    // elapsedMovementTime is updated in the update method
    expect(typeof npc.elapsedMovementTime).toBe('number')
  })

  it('should be able to draw like SimpleNpc', async () => {
    const npc = new ActiveNpc({
      characterInitializationOptions: {
        position: { x: 200, y: 300 },
        size: 15,
        imageSrc: './npc.png',
        velocity: { x: 0, y: 0 },
        sprites: mockSprites,
        health: 3,
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D

    npc.draw(mockContext)

    expect(mockContext.drawImage).toHaveBeenCalled()
  })
})
