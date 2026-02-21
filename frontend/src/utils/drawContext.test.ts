import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockContext } from '../test-setup'

vi.mock('./device', () => ({
  getDevicePixelRatio: vi.fn(() => 2),
}))

import { getDevicePixelRatio } from './device'
import { getDrawContext } from './drawContext'

describe('getDrawContext', () => {
  let mockContext: CanvasRenderingContext2D
  let mockCanvas: Partial<HTMLCanvasElement>

  beforeEach(() => {
    mockContext = createMockContext()
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(
        () => mockContext,
      ) as unknown as HTMLCanvasElement['getContext'],
    }
    vi.spyOn(document, 'querySelector').mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    )
    vi.mocked(getDevicePixelRatio).mockReturnValue(2)
  })

  it('returns null when canvas element is not found', () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = getDrawContext(false)
    expect(result).toBeNull()
    expect(errorSpy).toHaveBeenCalledWith('Canvas element not found')
  })

  it('returns the 2d context for desktop', () => {
    const result = getDrawContext(false)
    expect(result).toBe(mockContext)
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
  })

  it('sets canvas dimensions from config on desktop', () => {
    getDrawContext(false)
    expect(mockCanvas.width).toBe(1024)
    expect(mockCanvas.height).toBe(576)
  })

  it('sets canvas dimensions based on window size and pixel ratio on mobile', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true })
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
    })
    vi.mocked(getDevicePixelRatio).mockReturnValue(3)

    getDrawContext(true)

    expect(mockCanvas.width).toBe(1200)
    expect(mockCanvas.height).toBe(2400)
  })

  it('returns null when getContext returns null', () => {
    mockCanvas.getContext = vi.fn(() => null)
    const result = getDrawContext(false)
    expect(result).toBeNull()
  })
})
