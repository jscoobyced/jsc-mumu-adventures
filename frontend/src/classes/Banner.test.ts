import { describe, expect, it, vi } from 'vitest'
import { Banner } from './Banner'
import { Keys } from '../models'

vi.mock('../config.json', () => ({
  default: {
    canvasWidth: 1024,
    images: {
      ui: {
        banner: {
          path: './images/banner.png',
          width: 1024,
          height: 340,
        },
      },
    },
  },
}))

describe('Banner', () => {
  const createMockKeys = (): Keys => ({
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
    g: { pressed: false },
    q: { pressed: false },
    space: { pressed: false },
    spaceEnabled: false,
  })

  const createMockContext = () => ({
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    font: '',
    textAlign: '',
    fillStyle: '',
  })

  it('should create banner with correct dimensions', () => {
    const banner = new Banner({ x: 10, y: 10 })

    expect(banner.x).toBe(10)
    expect(banner.y).toBe(10)
    // Width: (1024 - 2*10) / 1024 * 1024 = 1004
    expect(banner.width).toBe(1004)
    // Height: 340 * ratio (approximately)
    expect(banner.height).toBeCloseTo(333, 0)
    expect(banner.loaded).toBe(false)
  })

  it('should load image on creation', () => {
    const banner = new Banner({ x: 0, y: 0 })

    expect(banner.image).toBeDefined()
    expect(banner.image.src).toContain('banner.png')
  })

  it('should set loaded flag when image loads', async () => {
    const banner = new Banner({ x: 0, y: 0 })

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(banner.loaded).toBe(true)
  })

  it('should not show banner initially', () => {
    const banner = new Banner({ x: 10, y: 10 })
    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    const result = banner.draw(context, keys)

    expect(result).toBe(false)
    expect(context.drawImage).not.toHaveBeenCalled()
  })

  it('should show banner with messages', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    banner.show(['Hello world!'])

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    banner.draw(context, keys)

    expect(context.drawImage).toHaveBeenCalled()
    expect(context.fillText).toHaveBeenCalled()
  })

  it('should show banner with portrait', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    const portraitImage = new Image()
    portraitImage.width = 64
    portraitImage.height = 64

    banner.show(['Hello!'], portraitImage)

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    banner.draw(context, keys)

    // Should draw banner and portrait
    expect(context.drawImage).toHaveBeenCalledTimes(2)
  })

  it('should advance to next message on space press', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    banner.show(['Message 1', 'Message 2'])

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    // First message, advance to second
    keys.space.pressed = true
    let result = banner.draw(context, keys)
    expect(result).toBe(false)
    expect(keys.space.pressed).toBe(false)

    // Second message, close banner
    keys.space.pressed = true
    result = banner.draw(context, keys)
    expect(result).toBe(true)
    expect(keys.spaceEnabled).toBe(false)
  })

  it('should close banner when reaching end of messages', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    banner.show(['Single message'])

    const keys = createMockKeys()
    keys.space.pressed = true
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    const result = banner.draw(context, keys)

    expect(result).toBe(true)
    expect(keys.spaceEnabled).toBe(false)
  })

  it('should handle close method', () => {
    const banner = new Banner({ x: 10, y: 10 })

    banner.show(['Message 1', 'Message 2'])
    banner.close()

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    const result = banner.draw(context, keys)

    expect(result).toBe(false)
    expect(context.drawImage).not.toHaveBeenCalled()
  })

  it('should wrap long text correctly', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    const longMessage = 'This is a very long message that should wrap across multiple lines when displayed in the banner'
    banner.show([longMessage])

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D
    // Mock measureText to trigger wrapping
    context.measureText = vi.fn((text: string) => ({
      width: text.length * 10,
    })) as unknown as typeof context.measureText

    banner.draw(context, keys)

    // fillText should be called multiple times for wrapped text
    expect(context.fillText).toHaveBeenCalled()
  })

  it('should handle empty message array', () => {
    const banner = new Banner({ x: 10, y: 10 })

    banner.show([])

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    const result = banner.draw(context, keys)

    expect(result).toBe(false)
  })

  it('should not advance message without space press', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    banner.show(['Message 1', 'Message 2'])

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    // Draw multiple times without pressing space
    banner.draw(context, keys)
    banner.draw(context, keys)
    banner.draw(context, keys)

    // Should still show first message
    expect(context.fillText).toHaveBeenCalled()
  })

  it('should adjust text position with portrait', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    const portraitImage = new Image()
    portraitImage.width = 100
    portraitImage.height = 100

    banner.show(['Message with portrait'], portraitImage)

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    banner.draw(context, keys)

    // Portrait should be drawn
    expect(context.drawImage).toHaveBeenCalledWith(
      portraitImage,
      30, // x + 20
      30, // y + 20
      100, // portrait size
      100,
    )
  })

  it('should set correct text styles', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    banner.show(['Styled message'])

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D

    banner.draw(context, keys)

    expect(context.font).toBe('24px MumuFont')
    expect(context.textAlign).toBe('center')
    expect(context.fillStyle).toBe('brown')
  })

  it('should handle text wrapping with single word exceeding maxWidth', async () => {
    const banner = new Banner({ x: 10, y: 10 })
    await new Promise((resolve) => setTimeout(resolve, 10))

    banner.show(['Short message'])

    const keys = createMockKeys()
    const context = createMockContext() as unknown as CanvasRenderingContext2D
    // Make each word exceed maxWidth
    context.measureText = vi.fn((text: string) => ({
      width: text.length > 5 ? 2000 : 100,
    })) as unknown as typeof context.measureText

    banner.draw(context, keys)

    expect(context.fillText).toHaveBeenCalled()
  })
})
