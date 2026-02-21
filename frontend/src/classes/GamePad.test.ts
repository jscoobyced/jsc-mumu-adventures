import { describe, expect, it, vi } from 'vitest'
import { GamePad, SPACING } from './GamePad'

const createGamePadContext = () => {
  const ctx = {
    canvas: { width: 1024, height: 576 },
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D
  return ctx
}

describe('SPACING', () => {
  it('is 20', () => {
    expect(SPACING).toBe(20)
  })
})

describe('GamePad', () => {
  describe('constructor', () => {
    it('sets width, lineColor, and lineWidth from arguments', () => {
      const pad = new GamePad(200, 'red', 3)
      expect(pad.width).toBe(200)
      expect(pad.lineColor).toBe('red')
      expect(pad.lineWidth).toBe(3)
    })

    it('defaults lineColor to white and lineWidth to 5', () => {
      const pad = new GamePad(100)
      expect(pad.lineColor).toBe('white')
      expect(pad.lineWidth).toBe(5)
    })
  })

  describe('draw', () => {
    it('saves and restores context', () => {
      const ctx = createGamePadContext()
      const pad = new GamePad(200)
      pad.draw(ctx)
      expect(ctx.save).toHaveBeenCalledOnce()
      expect(ctx.restore).toHaveBeenCalledOnce()
    })

    it('sets strokeStyle, lineWidth, and globalAlpha', () => {
      const ctx = createGamePadContext()
      const pad = new GamePad(200, 'blue', 4)
      pad.draw(ctx)
      expect(ctx.strokeStyle).toBe('blue')
      expect(ctx.lineWidth).toBe(4)
      expect(ctx.globalAlpha).toBe(0.5)
    })

    it('draws a circle at the correct position and radius', () => {
      const ctx = createGamePadContext()
      ctx.canvas.height = 576
      const width = 200
      const pad = new GamePad(width)

      pad.draw(ctx)

      const expectedX = width / 2 + SPACING
      const expectedY = 576 - width / 2 - SPACING
      const expectedRadius = width / 2

      expect(ctx.beginPath).toHaveBeenCalledOnce()
      expect(ctx.arc).toHaveBeenCalledWith(
        expectedX,
        expectedY,
        expectedRadius,
        0,
        2 * Math.PI,
      )
      expect(ctx.stroke).toHaveBeenCalledOnce()
    })

    it('computes position correctly for different canvas sizes', () => {
      const ctx = createGamePadContext()
      ctx.canvas.height = 800
      const width = 150
      const pad = new GamePad(width)

      pad.draw(ctx)

      expect(ctx.arc).toHaveBeenCalledWith(
        width / 2 + SPACING,
        800 - width / 2 - SPACING,
        width / 2,
        0,
        2 * Math.PI,
      )
    })
  })
})
