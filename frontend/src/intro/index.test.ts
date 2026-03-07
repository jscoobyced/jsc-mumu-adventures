import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../config.json', () => ({
  default: {
    tileSize: 16,
    cols: 50,
    rows: 50,
    canvasWidth: 1024,
    canvasHeight: 576,
    images: {
      tilesets: {
        intro: './images/intro.png',
        title: './images/title-text.png',
      },
    },
  },
}))

vi.mock('../utils/drawContext', () => ({
  getDrawContext: vi.fn(),
}))

vi.mock('../utils/eventListeners', () => ({
  getKeys: vi.fn(),
  getLastTime: vi.fn(() => 0),
  setLastTime: vi.fn(),
  initializeEventListeners: vi.fn(),
}))

vi.mock('../utils/game', () => ({
  startGame: vi.fn(),
}))

vi.mock('../utils/loadImage', () => ({
  loadImage: vi.fn(),
}))

vi.mock('../level', () => ({
  startRendering: vi.fn(),
}))

import * as drawContext from '../utils/drawContext'
import * as eventListeners from '../utils/eventListeners'
import * as game from '../utils/game'
import * as loadImage from '../utils/loadImage'
import { intro } from './index'

describe('intro', () => {
  let mockContext: CanvasRenderingContext2D
  let mockIntroImage: HTMLImageElement
  let mockTitleImage: HTMLImageElement
  let mockKeys: ReturnType<typeof eventListeners.getKeys>
  let animationFrameId: number

  beforeEach(() => {
    vi.clearAllMocks()
    animationFrameId = 0

    // Mock window.jsc for debug mode
    window.jsc = {
      appVersion: 'test',
      debug: false,
    }

    mockContext = {
      canvas: {
        width: 1024,
        height: 576,
        setAttribute: vi.fn(),
      },
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    mockIntroImage = Object.assign(new Image(), {
      src: './images/intro.png',
      width: 1024,
      height: 576,
    })

    mockTitleImage = Object.assign(new Image(), {
      src: './images/title-text.png',
      width: 200,
      height: 100,
    })

    mockKeys = {
      w: { pressed: false },
      a: { pressed: false },
      s: { pressed: false },
      d: { pressed: false },
      q: { pressed: false },
      space: { pressed: false },
      spaceEnabled: false,
    }

    vi.spyOn(drawContext, 'getDrawContext').mockReturnValue(mockContext)
    vi.spyOn(eventListeners, 'getKeys').mockReturnValue(mockKeys)
    vi.spyOn(game, 'startGame').mockImplementation(() => {})
    vi.spyOn(loadImage, 'loadImage')
      .mockResolvedValueOnce(mockIntroImage)
      .mockResolvedValueOnce(mockTitleImage)

    // Mock requestAnimationFrame to track calls without infinite loop
    const frameCallbacks: FrameRequestCallback[] = []
    global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      frameCallbacks.push(callback)
      return ++animationFrameId
    })

    // Mock performance.now() for animation
    vi.spyOn(performance, 'now').mockReturnValue(1000)
  })

  it('should throw error if context is null', async () => {
    vi.spyOn(drawContext, 'getDrawContext').mockReturnValue(null)

    await expect(intro()).rejects.toThrow(
      'Failed to get 2D context from canvas',
    )
  })

  it('should load intro and title images', async () => {
    await intro()

    expect(loadImage.loadImage).toHaveBeenCalledTimes(2)
    expect(loadImage.loadImage).toHaveBeenCalledWith('./images/intro.png')
    expect(loadImage.loadImage).toHaveBeenCalledWith('./images/title-text.png')
  })

  it('should start animation loop after loading images', async () => {
    await intro()

    expect(mockContext.drawImage).toHaveBeenCalled()
    expect(requestAnimationFrame).toHaveBeenCalled()
  })

  it('should draw intro image as background', async () => {
    await intro()

    expect(mockContext.drawImage).toHaveBeenCalledWith(
      mockIntroImage,
      0,
      0,
      mockContext.canvas.width,
      mockContext.canvas.height,
    )
  })

  it('should draw title image with animated y position', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(300)

    await intro()

    const expectedY = 100 + 10 * Math.sin(300 / 300) // = 100 + 10 * sin(1)
    const expectedX = mockContext.canvas.width / 2 - mockTitleImage.width / 2

    expect(mockContext.drawImage).toHaveBeenCalledWith(
      mockTitleImage,
      expectedX,
      expectedY,
    )
  })

  it('should calculate title y position based on time', async () => {
    const testTimes = [0, 300, 600, 900]

    for (const time of testTimes) {
      vi.clearAllMocks()

      // Reset the mocks for this iteration
      const freshMockContext = {
        canvas: {
          width: 1024,
          height: 576,
          setAttribute: vi.fn(),
        },
        drawImage: vi.fn(),
      } as unknown as CanvasRenderingContext2D

      const freshIntroImage = Object.assign(new Image(), {
        src: './images/intro.png',
        width: 1024,
        height: 576,
      })

      const freshTitleImage = Object.assign(new Image(), {
        src: './images/title-text.png',
        width: 200,
        height: 100,
      })

      vi.spyOn(drawContext, 'getDrawContext').mockReturnValue(freshMockContext)
      vi.spyOn(eventListeners, 'getKeys').mockReturnValue(mockKeys)
      vi.spyOn(game, 'startGame').mockImplementation(() => {})
      vi.spyOn(loadImage, 'loadImage')
        .mockResolvedValueOnce(freshIntroImage)
        .mockResolvedValueOnce(freshTitleImage)
      vi.spyOn(performance, 'now').mockReturnValue(time)

      await intro()

      const expectedY = 100 + 10 * Math.sin(time / 300)
      const expectedX =
        freshMockContext.canvas.width / 2 - freshTitleImage.width / 2

      expect(freshMockContext.drawImage).toHaveBeenCalledWith(
        freshTitleImage,
        expectedX,
        expectedY,
      )
    }
  })

  it('should start game when space is pressed', async () => {
    mockKeys.space.pressed = true

    await intro()

    expect(game.startGame).toHaveBeenCalledTimes(1)
    expect(mockKeys.space.pressed).toBe(false)
    expect(mockKeys.spaceEnabled).toBe(false)
  })

  it('should not call requestAnimationFrame when space is pressed', async () => {
    mockKeys.space.pressed = true

    await intro()

    // Should be called once for initial setup, but not again due to early return
    expect(requestAnimationFrame).toHaveBeenCalledTimes(0)
  })

  it('should continue animation loop when space is not pressed', async () => {
    mockKeys.space.pressed = false

    await intro()

    expect(requestAnimationFrame).toHaveBeenCalled()
    expect(game.startGame).not.toHaveBeenCalled()
  })

  it('should draw in correct order', async () => {
    await intro()

    const calls = (mockContext.drawImage as ReturnType<typeof vi.fn>).mock.calls
    expect(calls.length).toBeGreaterThanOrEqual(2)

    // First call should be intro image (background) with 5 arguments
    expect(calls[0].length).toBe(5)
    expect(calls[0][1]).toBe(0) // x position
    expect(calls[0][2]).toBe(0) // y position

    // Second call should be title image (foreground) with 3 arguments
    expect(calls[1].length).toBe(3)
  })

  it('should handle multiple animation frames', async () => {
    let frameCount = 0
    const maxFrames = 3

    global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      if (frameCount < maxFrames) {
        frameCount++
        setTimeout(() => callback(performance.now()), 0)
      }
      return ++animationFrameId
    })

    await intro()

    // Wait for a few frames to process
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(mockContext.drawImage).toHaveBeenCalled()
  })
})
