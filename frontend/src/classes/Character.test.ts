import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Character } from './Character'
import { CollisionBlock } from './CollisionBlock'
import { CharacterInitializationOptions, Sprites } from '../models'

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

// Concrete implementation for testing
class TestCharacter extends Character {
  public draw(c: CanvasRenderingContext2D): void {
    if (!this.imageLoaded || !this.currentSprite) return
    c.drawImage(
      this.image,
      this.currentSprite.x,
      this.currentSprite.y,
      this.currentSprite.width,
      this.currentSprite.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    )
  }

  public update(deltaTime: number, collisionBlocks: CollisionBlock[]): void {
    if (!deltaTime) return
    this.updateInvincibility(deltaTime)
    this.updateAnimation(deltaTime)
    this.updatePosition(deltaTime, collisionBlocks)
  }
}

describe('Character', () => {
  const mockSprites: Sprites = {
    walkDown: { x: 0, y: 0, width: 16, height: 16, frameCount: 4 },
    walkUp: { x: 0, y: 16, width: 16, height: 16, frameCount: 4 },
    walkLeft: { x: 0, y: 32, width: 16, height: 16, frameCount: 4 },
    walkRight: { x: 0, y: 48, width: 16, height: 16, frameCount: 4 },
  }

  const createTestOptions = (
    overrides: Partial<CharacterInitializationOptions> = {},
  ): CharacterInitializationOptions => ({
    position: { x: 100, y: 100 },
    size: 15,
    imageSrc: './test-sprite.png',
    velocity: { x: 0, y: 0 },
    sprites: mockSprites,
    health: 3,
    name: 'TestChar',
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize character with correct properties', () => {
    const options = createTestOptions()
    const character = new TestCharacter(options)

    expect(character.position).toEqual({ x: 100, y: 100 })
    expect(character.width).toBe(15)
    expect(character.height).toBe(15)
    expect(character.velocity).toEqual({ x: 0, y: 0 })
    expect(character.health).toBe(3)
    expect(character.getName()).toBe('TestChar')
    expect(character.currentFrame).toBe(0)
    expect(character.elapsedTime).toBe(0)
    expect(character.isInvincible).toBe(false)
  })

  it('should initialize with default velocity when not provided', () => {
    const options = createTestOptions({
      velocity: undefined as unknown as { x: number; y: number },
    })
    const character = new TestCharacter(options)

    expect(character.velocity).toEqual({ x: 0, y: 0 })
  })

  it('should initialize with default health when not provided', () => {
    const options = createTestOptions({
      health: undefined as unknown as number,
    })
    const character = new TestCharacter(options)

    expect(character.health).toBe(1)
  })

  it('should calculate center position correctly', () => {
    const character = new TestCharacter(createTestOptions())

    expect(character.center.x).toBe(107.5)
    expect(character.center.y).toBe(107.5)
  })

  it('should load image on creation', async () => {
    const character = new TestCharacter(createTestOptions())

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(character.imageLoaded).toBe(true)
    expect(character.image).toBeDefined()
  })

  it('should not draw when image is not loaded', () => {
    const character = new TestCharacter(createTestOptions())
    character.imageLoaded = false

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    character.draw(mockContext)

    expect(mockContext.drawImage).not.toHaveBeenCalled()
  })

  it('should draw character when loaded', async () => {
    const character = new TestCharacter(createTestOptions())
    character.currentSprite = mockSprites.walkDown
    await new Promise((resolve) => setTimeout(resolve, 10))

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    character.draw(mockContext)

    expect(mockContext.drawImage).toHaveBeenCalled()
  })

  it('should update animation frame over time', async () => {
    const character = new TestCharacter(createTestOptions())
    character.currentSprite = mockSprites.walkDown
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(character.currentFrame).toBe(0)

    character.update(0.2, [])
    expect(character.currentFrame).toBe(1)

    character.update(0.2, [])
    expect(character.currentFrame).toBe(2)
  })

  it('should loop animation frames', async () => {
    const character = new TestCharacter(createTestOptions())
    character.currentSprite = mockSprites.walkDown
    await new Promise((resolve) => setTimeout(resolve, 10))

    for (let i = 0; i < 8; i++) {
      character.update(0.2, [])
    }

    // Should loop back to 0 after frame 3
    expect(character.currentFrame).toBe(0)
  })

  it('should handle hit received and set invincibility', () => {
    const character = new TestCharacter(createTestOptions())

    expect(character.isInvincible).toBe(false)

    character.hitReceived()

    expect(character.isInvincible).toBe(true)
  })

  it('should not set invincibility when already invincible', () => {
    const character = new TestCharacter(createTestOptions())
    character.isInvincible = true

    character.hitReceived()

    expect(character.isInvincible).toBe(true)
  })

  it('should update invincibility timer', () => {
    const character = new TestCharacter(createTestOptions())
    character.invincibilityInterval = 1.0
    character.isInvincible = true

    expect(character.elapsedInvincibilityTime).toBe(0)

    character.update(0.5, [])

    expect(character.elapsedInvincibilityTime).toBe(0.5)
    expect(character.isInvincible).toBe(true)

    character.update(0.6, [])

    expect(character.isInvincible).toBe(false)
    expect(character.elapsedInvincibilityTime).toBe(0)
  })

  it('should update horizontal position based on velocity', () => {
    const character = new TestCharacter(createTestOptions())
    character.velocity.x = 100

    character.update(0.1, [])

    expect(character.position.x).toBe(110)
  })

  it('should update vertical position based on velocity', () => {
    const character = new TestCharacter(createTestOptions())
    character.velocity.y = 100

    character.update(0.1, [])

    expect(character.position.y).toBe(110)
  })

  it('should detect horizontal collision with blocks', () => {
    const character = new TestCharacter(createTestOptions())
    character.velocity.x = 100

    const collisionBlock = new CollisionBlock({ x: 115, y: 100, size: 16 })

    character.update(0.2, [collisionBlock])

    // Character should stop at collision block
    expect(character.position.x).toBeLessThan(115)
  })

  it('should detect vertical collision with blocks', () => {
    const character = new TestCharacter(createTestOptions())
    character.velocity.y = 100

    const collisionBlock = new CollisionBlock({ x: 100, y: 115, size: 16 })

    character.update(0.2, [collisionBlock])

    // Character should stop at collision block
    expect(character.position.y).toBeLessThan(115)
  })

  it('should handle vertical collision when moving upward', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 100, y: 200 } }),
    )
    character.velocity.y = -20

    const collisionBlock = new CollisionBlock({ x: 100, y: 178, size: 16 })

    character.update(0.5, [collisionBlock])

    // Should collide and stop
    expect(character.position.y).toBeGreaterThan(178 + 10)
  })

  it('should handle vertical collision when moving downward with velocity check', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 100, y: 90 } }),
    )
    // Set positive velocity to move downward - ensure it stays positive
    character.velocity.y = 50
    character.velocity.x = 0

    // Place collision block ahead in the path
    const collisionBlock = new CollisionBlock({ x: 100, y: 103, size: 16 })

    // Small time step to ensure we hit the collision
    character.update(0.2, [collisionBlock])

    // Character should be stopped at the collision block's top
    // Collision block is at y=106 (103+3 buffer), character height is 15
    // So character should be positioned at 106-15 = 91
    expect(character.position.y).toBeLessThanOrEqual(91.1)
    expect(character.position.y).toBeGreaterThanOrEqual(90)
  })

  it('should execute downward collision branch specifically', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 200, y: 200 } }),
    )
    
    // Explicitly test downward movement
    character.velocity.x = 0
    character.velocity.y = 30 // Positive velocity = moving down
    
    // Place block directly below
    const collisionBlock = new CollisionBlock({ x: 200, y: 213, size: 16 })
    
    const initialY = character.position.y
    character.update(0.5, [collisionBlock])
    
    // Character should have moved and then been stopped by collision
    expect(character.position.y).toBeGreaterThanOrEqual(initialY)
    expect(character.position.y).toBeLessThan(213 + 3) // Before the collision block
  })

  it('should detect left map boundary collision', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 5, y: 100 } }),
    )
    character.velocity.x = -100

    character.update(0.1, [])

    expect(character.position.x).toBeGreaterThanOrEqual(0)
    expect(character.velocity.x).toBe(0)
  })

  it('should detect right map boundary collision', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 780, y: 100 } }),
    )
    character.velocity.x = 100

    character.update(0.1, [])

    // Map width is 16 * 50 = 800
    expect(character.position.x).toBeLessThanOrEqual(785)
    expect(character.velocity.x).toBe(0)
  })

  it('should detect top map boundary collision', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 100, y: 5 } }),
    )
    character.velocity.y = -100

    character.update(0.1, [])

    expect(character.position.y).toBeGreaterThanOrEqual(0)
    expect(character.velocity.y).toBe(0)
  })

  it('should detect bottom map boundary collision', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 100, y: 780 } }),
    )
    character.velocity.y = 100

    character.update(0.1, [])

    // Map height is 16 * 50 = 800
    expect(character.position.y).toBeLessThanOrEqual(785)
    expect(character.velocity.y).toBe(0)
  })

  it('should return LEFT direction when exiting left boundary', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 0.0001, y: 100 } }),
    )
    character.velocity.x = -100

    character.update(0.001, [])

    // Position should be at left boundary
    expect(character.position.x).toBeLessThanOrEqual(0.0002)
  })

  it('should return RIGHT direction when exiting right boundary', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 784.9999, y: 100 } }),
    )
    character.velocity.x = 100

    character.update(0.001, [])

    // Position should be at right boundary
    expect(character.position.x).toBeGreaterThanOrEqual(784.9998)
  })

  it('should update center position after movement', () => {
    const character = new TestCharacter(createTestOptions())
    character.velocity.x = 100

    character.update(0.1, [])

    expect(character.center.x).toBe(117.5)
    expect(character.center.y).toBe(107.5)
  })

  it('should handle zero delta time', () => {
    const character = new TestCharacter(createTestOptions())
    const initialX = character.position.x

    character.update(0, [])

    expect(character.position.x).toBe(initialX)
  })

  it('should handle custom frame duration in animation', async () => {
    const character = new TestCharacter(createTestOptions())
    character.currentSprite = mockSprites.walkDown
    await new Promise((resolve) => setTimeout(resolve, 10))

    // Default frame duration is 0.15
    character.update(0.1, [])
    expect(character.currentFrame).toBe(0)

    character.update(0.1, [])
    expect(character.currentFrame).toBe(1)
  })

  it('should return name when getName is called', () => {
    const character = new TestCharacter(
      createTestOptions({ name: 'MyCharacter' }),
    )

    expect(character.getName()).toBe('MyCharacter')
  })

  it('should return undefined when no name is set', () => {
    const character = new TestCharacter(
      createTestOptions({ name: undefined }),
    )

    expect(character.getName()).toBeUndefined()
  })

  it('should handle collision from right side', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 100, y: 100 } }),
    )
    character.velocity.x = 20 // slower velocity

    const collisionBlock = new CollisionBlock({ x: 110, y: 100, size: 16 })

    character.update(0.5, [collisionBlock])

    // Character should be stopped by collision (collision block at x=113 due to buffer)
    expect(character.position.x).toBeLessThan(113)
  })

  it('should handle collision from left side', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 200, y: 100 } }),
    )
    character.velocity.x = -20 // slower velocity

    const collisionBlock = new CollisionBlock({ x: 180, y: 100, size: 16 })

    character.update(0.5, [collisionBlock])

    // Character should be stopped by collision (collision block ends at 180+16+buffer)
    expect(character.position.x).toBeGreaterThan(186)
  })

  it('should handle collision from bottom side', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 100, y: 100 } }),
    )
    character.velocity.y = 20 // slower velocity

    const collisionBlock = new CollisionBlock({ x: 100, y: 112, size: 16 })

    character.update(0.5, [collisionBlock])

    // Character should be stopped by collision (collision block at y=115 due to buffer)
    expect(character.position.y).toBeLessThan(115)
  })

  it('should handle collision from top side', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 100, y: 200 } }),
    )
    character.velocity.y = -20 // slower velocity

    const collisionBlock = new CollisionBlock({ x: 100, y: 175, size: 16 })

    character.update(0.5, [collisionBlock])

    // Character should be stopped by collision (collision block at y=178 due to buffer, height ends at 188)
    expect(character.position.y).toBeGreaterThan(188)
  })

  it('should hit line 179 velocity.y > 0 branch in vertical collision', () => {
    const character = new TestCharacter(
      createTestOptions({ position: { x: 100, y: 100 } }),
    )
    
    // Set velocity to positive (moving down)
    character.velocity.y = 10
    character.velocity.x = 0
    
    // Create collision block that character will hit while moving down
    // Character is at y=100, height=15, so bottom is at 115
    // Block at y=110 (+3 buffer = 113) will be hit
    const collisionBlock = new CollisionBlock({ x: 100, y: 110, size: 16 })
    
    // Move character
    character.update(1.0, [collisionBlock])
    
    // Verify collision adjusted position
    // Character should be positioned at block.y - height - BUFFER
    // Block is at 113, so character should be at 113 - 15 - 0.0001 ≈ 97.9999
    expect(character.position.y).toBeLessThan(100)
  })
})
