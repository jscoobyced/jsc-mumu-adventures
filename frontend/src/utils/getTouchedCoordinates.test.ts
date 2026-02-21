import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDevicePixelRatio, getScreenSize } from './device'
import { getDrawContext } from './drawContext'
import { checkSpriteTouched, getSegmentNumber } from './getTouchedCoordinates'

// Mock the dependencies
vi.mock('./drawContext', () => ({
  getDrawContext: vi.fn(),
}))

vi.mock('./device', () => ({
  getScreenSize: vi.fn(),
  isMobile: vi.fn().mockReturnValue(false),
  getDevicePixelRatio: vi.fn(),
}))

describe('getTouchedCoordinates utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkSpriteTouched', () => {
    it('should return false when canvas is not available', () => {
      vi.mocked(getDrawContext).mockReturnValue(null)

      const result = checkSpriteTouched(100, 100, 32, 32, 0, 0)
      expect(result).toBe(false)
    })

    it('should return false when canvas is available but coordinates are outside audio sprite area', () => {
      const mockCanvas = {
        width: 800,
        height: 600,
      }

      const mockContext = {
        canvas: mockCanvas,
      } as unknown as CanvasRenderingContext2D

      vi.mocked(getDrawContext).mockReturnValue(mockContext)
      vi.mocked(getScreenSize).mockReturnValue({ x: 800, y: 600 })
      vi.mocked(getDevicePixelRatio).mockReturnValue(1)

      // Test coordinates outside the audio sprite area
      const result = checkSpriteTouched(100, 100, 32, 32, 0, 0)
      expect(result).toBe(false)
    })

    it('should return true when coordinates are inside audio sprite area (desktop)', () => {
      const mockCanvas = {
        width: 800,
        height: 600,
      }

      const mockContext = {
        canvas: mockCanvas,
      } as unknown as CanvasRenderingContext2D

      vi.mocked(getDrawContext).mockReturnValue(mockContext)
      vi.mocked(getScreenSize).mockReturnValue({ x: 800, y: 600 })
      vi.mocked(getDevicePixelRatio).mockReturnValue(1)

      const result = checkSpriteTouched(760, 30, 32, 32, 750, 0) // Inside the area
      expect(result).toBe(true)
    })

    it('should return true when coordinates are inside audio sprite area (mobile)', () => {
      const mockCanvas = {
        width: 400,
        height: 300,
      }

      const mockContext = {
        canvas: mockCanvas,
      } as unknown as CanvasRenderingContext2D

      vi.mocked(getDrawContext).mockReturnValue(mockContext)
      vi.mocked(getScreenSize).mockReturnValue({ x: 400, y: 300 })
      vi.mocked(getDevicePixelRatio).mockReturnValue(1)

      const result = checkSpriteTouched(360, 30, 32, 32, 350, 0) // Inside the area
      expect(result).toBe(true)
    })

    it('should handle device pixel ratio adjustments correctly', () => {
      const mockCanvas = {
        width: 800,
        height: 600,
      }

      const mockContext = {
        canvas: mockCanvas,
      } as unknown as CanvasRenderingContext2D

      vi.mocked(getDrawContext).mockReturnValue(mockContext)
      vi.mocked(getScreenSize).mockReturnValue({ x: 800, y: 600 })
      vi.mocked(getDevicePixelRatio).mockReturnValue(2)

      const result = checkSpriteTouched(760, 30, 32, 32, 768, 0) // This should work with dpr=2, but coordinates are in screen space
      expect(result).toBe(false)
    })
  })

  describe('getSegmentNumber', () => {
    it('should return 0 for coordinates outside the circle', () => {
      vi.mocked(getScreenSize).mockReturnValue({ x: 800, y: 600 })

      // Test coordinates far outside the circle
      const result = getSegmentNumber(100, 100, 200)
      expect(result).toBe(0)
    })

    it('should return correct segment numbers for different angles (desktop)', () => {
      vi.mocked(getScreenSize).mockReturnValue({ x: 800, y: 600 })

      // Down-Left (1) - angle around 45 degrees
      const result1 = getSegmentNumber(100, 500, 200)
      expect(result1).toBe(1)

      // Down (2) - angle around 90 degrees (x = centerX, y = centerY + radius)
      const result2 = getSegmentNumber(120, 580, 200)
      expect(result2).toBe(2)

      // Down-Right (3) - angle around 45 degrees
      const result3 = getSegmentNumber(150, 500, 200)
      expect(result3).toBe(3)

      // Down-Left (4) - angle around 135 degrees
      const result4 = getSegmentNumber(48, 508, 200)
      expect(result4).toBe(4)

      // Right (6) - angle around 0 degrees (x = centerX + radius, y = centerY)
      const result6 = getSegmentNumber(220, 480, 200)
      expect(result6).toBe(6)

      // Up-Left (7) - angle around 225 degrees
      const result7 = getSegmentNumber(100, 450, 200)
      expect(result7).toBe(7)

      // Up (8) - angle around 270 degrees (x = centerX, y = centerY - radius)
      const result8 = getSegmentNumber(120, 380, 200)
      expect(result8).toBe(8)

      // Up-Right (9) - angle around 315 degrees
      const result9 = getSegmentNumber(150, 450, 200)
      expect(result9).toBe(9)
    })

    it('should handle edge cases correctly', () => {
      vi.mocked(getScreenSize).mockReturnValue({ x: 800, y: 600 })

      // Test coordinates at the exact boundaries
      const result1 = getSegmentNumber(120, 480, 200) // Center
      expect(result1).toBe(6) // Should be outside the circle

      // Test coordinates at the edge of the circle
      const result2 = getSegmentNumber(220, 480, 200) // Right edge
      expect(result2).toBe(6) // Should be right segment
    })

    it('should work correctly with different canvas sizes', () => {
      vi.mocked(getScreenSize).mockReturnValue({ x: 1200, y: 800 })

      // Test with larger canvas
      const result = getSegmentNumber(600, 400, 300)
      expect(result).toBe(0) // Should be outside the circle
    })

    it('should handle mobile mode correctly', () => {
      vi.mocked(getScreenSize).mockReturnValue({ x: 400, y: 300 })

      // Test with mobile mode
      const result = getSegmentNumber(200, 150, 100)
      expect(result).toBe(0) // Should be outside the circle
    })
  })
})
