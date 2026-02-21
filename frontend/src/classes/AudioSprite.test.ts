import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  state: { isMobile: false },
  getDrawContext: vi.fn(),
  getRatio: vi.fn(() => ({ xRatio: 1, yRatio: 1 })),
  checkSpriteTouched: vi.fn(() => false),
}))

vi.mock('../utils/music', () => ({
  isAudioPlaying: vi.fn(() => true),
}))

vi.mock('../utils/device', () => ({
  get isMobile() {
    return mocks.state.isMobile
  },
}))

vi.mock('../utils/drawContext', () => ({
  getDrawContext: mocks.getDrawContext,
}))

vi.mock('../utils/getTouchedCoordinates', () => ({
  getRatio: mocks.getRatio,
  checkSpriteTouched: mocks.checkSpriteTouched,
}))

import { isAudioPlaying } from '../utils/music'
import { AudioSprite, checkAudioSpriteTouched } from './AudioSprite'

describe('AudioSprite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.isMobile = false
    mocks.getRatio.mockReturnValue({ xRatio: 1, yRatio: 1 })
    mocks.getDrawContext.mockReturnValue({
      canvas: { width: 1024, height: 576 },
    })
  })

  describe('constructor', () => {
    it('sets position, size, and center', () => {
      const sprite = new AudioSprite({ x: 10, y: 20 }, 32)
      expect(sprite.x).toBe(10)
      expect(sprite.y).toBe(20)
      expect(sprite.width).toBe(32)
      expect(sprite.height).toBe(32)
      expect(sprite.center).toEqual({ x: 26, y: 36 })
    })

    it('defaults currentFrame to 0', () => {
      const sprite = new AudioSprite({ x: 0, y: 0 }, 16)
      expect(sprite.currentFrame).toBe(0)
    })

    it('accepts a custom currentFrame', () => {
      const sprite = new AudioSprite({ x: 0, y: 0 }, 16, 1)
      expect(sprite.currentFrame).toBe(1)
    })

    it('initializes currentSprite config', () => {
      const sprite = new AudioSprite({ x: 0, y: 0 }, 16)
      expect(sprite.currentSprite).toEqual({
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        frameCount: 2,
      })
    })

    it('starts as not loaded and sets loaded on image onload', async () => {
      const sprite = new AudioSprite({ x: 0, y: 0 }, 16)
      expect(sprite.loaded).toBe(false)
      // Image mock fires onload via setTimeout(0)
      await vi.waitFor(() => expect(sprite.loaded).toBe(true))
    })

    it('sets image src from config', () => {
      const sprite = new AudioSprite({ x: 0, y: 0 }, 16)
      expect(sprite.image.src).toBe('./images/sprites/audio.png')
    })
  })

  describe('draw', () => {
    const createCtx = () =>
      ({ drawImage: vi.fn() }) as unknown as CanvasRenderingContext2D

    it('does nothing when image is not loaded', () => {
      const sprite = new AudioSprite({ x: 0, y: 0 }, 32)
      sprite.loaded = false
      const ctx = createCtx()
      sprite.draw(ctx)
      expect(ctx.drawImage).not.toHaveBeenCalled()
    })

    it('draws frame 0 when audio is playing', () => {
      vi.mocked(isAudioPlaying).mockReturnValue(true)
      const sprite = new AudioSprite({ x: 5, y: 10 }, 24)
      sprite.loaded = true
      const ctx = createCtx()
      sprite.draw(ctx)

      expect(sprite.currentFrame).toBe(0)
      expect(ctx.drawImage).toHaveBeenCalledWith(
        sprite.image,
        0, // x + width * frame 0
        0,
        32,
        32,
        5,
        10,
        24,
        24,
      )
    })

    it('draws frame 1 when audio is not playing', () => {
      vi.mocked(isAudioPlaying).mockReturnValue(false)
      const sprite = new AudioSprite({ x: 5, y: 10 }, 24)
      sprite.loaded = true
      const ctx = createCtx()
      sprite.draw(ctx)

      expect(sprite.currentFrame).toBe(1)
      expect(ctx.drawImage).toHaveBeenCalledWith(
        sprite.image,
        32, // x + width * frame 1
        0,
        32,
        32,
        5,
        10,
        24,
        24,
      )
    })
  })

  describe('setMuted', () => {
    it('sets currentFrame to 0 when muted', () => {
      const sprite = new AudioSprite({ x: 0, y: 0 }, 16)
      sprite.setMuted(true)
      expect(sprite.currentFrame).toBe(0)
    })

    it('sets currentFrame to 1 when not muted', () => {
      const sprite = new AudioSprite({ x: 0, y: 0 }, 16)
      sprite.setMuted(false)
      expect(sprite.currentFrame).toBe(1)
    })
  })

  describe('checkAudioSpriteTouched', () => {
    it('returns false when no canvas context is available', () => {
      mocks.getDrawContext.mockReturnValue(null)
      expect(checkAudioSpriteTouched(10, 20)).toBe(false)
      expect(mocks.checkSpriteTouched).not.toHaveBeenCalled()
    })

    it('uses desktop ratios and forwards computed bounds to checkSpriteTouched', () => {
      mocks.state.isMobile = false
      mocks.getDrawContext.mockReturnValue({
        canvas: { width: 1024, height: 576 },
      })
      mocks.getRatio.mockReturnValue({ xRatio: 2, yRatio: 4 })
      mocks.checkSpriteTouched.mockReturnValue(true)

      const touched = checkAudioSpriteTouched(100, 200)

      expect(touched).toBe(true)
      expect(mocks.checkSpriteTouched).toHaveBeenCalledWith(
        100,
        200,
        16,
        16,
        998,
        5,
      )
    })

    it('uses mobile ratios and forwards computed bounds to checkSpriteTouched', () => {
      mocks.state.isMobile = true
      mocks.getDrawContext.mockReturnValue({
        canvas: { width: 1200, height: 800 },
      })
      mocks.getRatio.mockReturnValue({ xRatio: 1.5, yRatio: 2 })
      mocks.checkSpriteTouched.mockReturnValue(false)

      const touched = checkAudioSpriteTouched(50, 60)

      expect(touched).toBe(false)
      expect(mocks.checkSpriteTouched).toHaveBeenCalledWith(
        50,
        60,
        48,
        48,
        1122,
        40,
      )
    })
  })
})
