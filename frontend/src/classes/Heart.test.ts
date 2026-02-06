import { describe, expect, it, vi } from 'vitest'
import { Heart } from './Heart'

vi.mock('../config.json', () => ({
  default: {
    images: {
      decorations: {
        heart: './images/sprites/heart.png',
      },
    },
  },
}))

describe('Heart', () => {
  it('should create a heart with default frame 0', () => {
    const heart = new Heart({ x: 10, y: 20 }, 20)

    expect(heart.x).toBe(10)
    expect(heart.y).toBe(20)
    expect(heart.width).toBe(20)
    expect(heart.height).toBe(20)
    expect(heart.currentFrame).toBe(0)
    expect(heart.loaded).toBe(false)
  })

  it('should create a heart with custom frame', () => {
    const heart = new Heart({ x: 10, y: 20 }, 20, 4)

    expect(heart.currentFrame).toBe(4)
  })

  it('should calculate center position correctly', () => {
    const heart = new Heart({ x: 10, y: 20 }, 20)

    expect(heart.center.x).toBe(20)
    expect(heart.center.y).toBe(30)
  })

  it('should have correct sprite configuration', () => {
    const heart = new Heart({ x: 0, y: 0 }, 20)

    expect(heart.currentSprite.x).toBe(0)
    expect(heart.currentSprite.y).toBe(0)
    expect(heart.currentSprite.width).toBe(16)
    expect(heart.currentSprite.height).toBe(16)
    expect(heart.currentSprite.frameCount).toBe(4)
  })

  it('should load image on creation', () => {
    const heart = new Heart({ x: 0, y: 0 }, 20)

    expect(heart.image).toBeDefined()
    expect(heart.image.src).toContain('heart.png')
  })

  it('should set loaded flag when image loads', async () => {
    const heart = new Heart({ x: 0, y: 0 }, 20)

    // Wait for image to load
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(heart.loaded).toBe(true)
  })

  it('should not draw when image is not loaded', () => {
    const heart = new Heart({ x: 10, y: 20 }, 20, 2)
    heart.loaded = false

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    heart.draw(mockContext)

    expect(mockContext.drawImage).not.toHaveBeenCalled()
  })

  it('should draw heart when loaded with correct frame', async () => {
    const heart = new Heart({ x: 10, y: 20 }, 20, 2)

    // Wait for image to load
    await new Promise((resolve) => setTimeout(resolve, 10))

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    heart.draw(mockContext)

    expect(mockContext.drawImage).toHaveBeenCalledWith(
      heart.image,
      32, // currentSprite.x + currentSprite.width * currentFrame = 0 + 16 * 2
      0, // currentSprite.y
      16, // currentSprite.width
      16, // currentSprite.height
      10, // heart.x
      20, // heart.y
      20, // heart.width
      20, // heart.height
    )
  })

  it('should draw heart with frame 0 (empty heart)', async () => {
    const heart = new Heart({ x: 5, y: 10 }, 30, 0)

    await new Promise((resolve) => setTimeout(resolve, 10))

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    heart.draw(mockContext)

    expect(mockContext.drawImage).toHaveBeenCalledWith(
      heart.image,
      0, // frame 0
      0,
      16,
      16,
      5,
      10,
      30,
      30,
    )
  })

  it('should draw heart with frame 4 (full heart)', async () => {
    const heart = new Heart({ x: 15, y: 25 }, 25, 4)

    await new Promise((resolve) => setTimeout(resolve, 10))

    const mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    heart.draw(mockContext)

    expect(mockContext.drawImage).toHaveBeenCalledWith(
      heart.image,
      64, // 16 * 4
      0,
      16,
      16,
      15,
      25,
      25,
      25,
    )
  })
})
