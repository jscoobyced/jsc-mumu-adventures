import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDevicePixelRatio } from './device'
import { getDrawContext } from './drawContext'

vi.mock('../config.json', () => ({
  default: {
    canvasWidth: 1024,
    canvasHeight: 576,
  },
}))

describe('drawContext', () => {
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    vi.clearAllMocks()

    mockContext = {
      canvas: {
        width: 0,
        height: 0,
      },
    } as unknown as CanvasRenderingContext2D

    mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 0,
      height: 0,
    } as unknown as HTMLCanvasElement

    document.querySelector = vi.fn(() => mockCanvas)
  })

  describe('getDrawContext', () => {
    it('should query for canvas element', () => {
      getDrawContext(false)

      expect(document.querySelector).toHaveBeenCalledWith('canvas')
    })

    it('should get 2d context from canvas', () => {
      getDrawContext(false)

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('should set canvas width based on config and dpr', () => {
      getDrawContext(false)

      expect(mockCanvas.width).toBe(1024 * getDevicePixelRatio())
    })

    it('should set canvas height based on config and dpr', () => {
      getDrawContext(false)

      expect(mockCanvas.height).toBe(576 * getDevicePixelRatio())
    })

    it('should return canvas context', () => {
      const result = getDrawContext(false)

      expect(result).toBe(mockContext)
    })

    it('should return null if getContext returns null', () => {
      mockCanvas.getContext = vi.fn(() => null)

      const result = getDrawContext(false)

      expect(result).toBeNull()
    })

    it('should handle canvas element not found', () => {
      document.querySelector = vi.fn(() => null)

      expect(() => getDrawContext(false)).toThrow()
    })
  })
})
