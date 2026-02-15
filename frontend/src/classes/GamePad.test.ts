import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GamePad, getSegmentNumber } from './GamePad'

vi.mock('../utils/device', () => ({
  getScreenSize: vi.fn(() => ({ x: 1024, y: 768 })),
  isMobile: false,
}))

vi.mock('../utils/drawContext', () => ({
  getDrawContext: vi.fn(() => ({
    canvas: { width: 1024, height: 768 },
  })),
}))

describe('GamePad', () => {
  const createMockContext = () => ({
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    canvas: { width: 1024, height: 768 },
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create a gamepad with default values', () => {
      const pad = new GamePad(200)

      expect(pad.width).toBe(200)
      expect(pad.lineColor).toBe('white')
      expect(pad.lineWidth).toBe(5)
    })

    it('should create a gamepad with custom values', () => {
      const pad = new GamePad(300, 'red', 3)

      expect(pad.width).toBe(300)
      expect(pad.lineColor).toBe('red')
      expect(pad.lineWidth).toBe(3)
    })
  })

  describe('draw', () => {
    it('should save and restore context', () => {
      const pad = new GamePad(200)
      const context = createMockContext() as unknown as CanvasRenderingContext2D

      pad.draw(context)

      expect(context.save).toHaveBeenCalledOnce()
      expect(context.restore).toHaveBeenCalledOnce()
    })

    it('should set stroke style and line width', () => {
      const pad = new GamePad(200, 'blue', 4)
      const context = createMockContext() as unknown as CanvasRenderingContext2D

      pad.draw(context)

      expect(context.strokeStyle).toBe('blue')
      expect(context.lineWidth).toBe(4)
    })

    it('should set global alpha to 0.5', () => {
      const pad = new GamePad(200)
      const context = createMockContext() as unknown as CanvasRenderingContext2D

      pad.draw(context)

      expect(context.globalAlpha).toBe(0.5)
    })

    it('should draw a circle with correct parameters', () => {
      const pad = new GamePad(200)
      const context = createMockContext() as unknown as CanvasRenderingContext2D

      pad.draw(context)

      expect(context.beginPath).toHaveBeenCalledOnce()
      // centerX = 200/2 + 50 = 150, centerY = 768 - 200/2 - 50 = 618, radius = 100
      expect(context.arc).toHaveBeenCalledWith(150, 618, 100, 0, 2 * Math.PI)
      expect(context.stroke).toHaveBeenCalledOnce()
    })
  })

  describe('getSegmentNumber', () => {
    const WIDTH = 200
    // center of gamepad: x = 200/2 + 50 = 150, y = 768 - 200/2 - 50 = 618
    const CENTER_X = 150
    const CENTER_Y = 618

    it('should return 0 for coordinates outside the circle', () => {
      const result = getSegmentNumber(0, 0, WIDTH)

      expect(result).toBe(0)
    })

    it('should return 6 (Right) for coordinates to the right of center', () => {
      const result = getSegmentNumber(CENTER_X + 50, CENTER_Y, WIDTH)

      expect(result).toBe(6)
    })

    it('should return 4 (Left) for coordinates to the left of center', () => {
      const result = getSegmentNumber(CENTER_X - 50, CENTER_Y, WIDTH)

      expect(result).toBe(4)
    })

    it('should return 8 (Up) for coordinates above center', () => {
      const result = getSegmentNumber(CENTER_X, CENTER_Y - 50, WIDTH)

      expect(result).toBe(8)
    })

    it('should return 2 (Down) for coordinates below center', () => {
      const result = getSegmentNumber(CENTER_X, CENTER_Y + 50, WIDTH)

      expect(result).toBe(2)
    })

    it('should return 9 (Up-Right) for diagonal up-right', () => {
      const result = getSegmentNumber(CENTER_X + 40, CENTER_Y - 40, WIDTH)

      expect(result).toBe(9)
    })

    it('should return 7 (Up-Left) for diagonal up-left', () => {
      const result = getSegmentNumber(CENTER_X - 40, CENTER_Y - 40, WIDTH)

      expect(result).toBe(7)
    })

    it('should return 3 (Down-Right) for diagonal down-right', () => {
      const result = getSegmentNumber(CENTER_X + 40, CENTER_Y + 40, WIDTH)

      expect(result).toBe(3)
    })

    it('should return 1 (Down-Left) for diagonal down-left', () => {
      const result = getSegmentNumber(CENTER_X - 40, CENTER_Y + 40, WIDTH)

      expect(result).toBe(1)
    })

    it('should return 0 for coordinates far outside the circle', () => {
      const result = getSegmentNumber(900, 100, WIDTH)

      expect(result).toBe(0)
    })
  })
})
