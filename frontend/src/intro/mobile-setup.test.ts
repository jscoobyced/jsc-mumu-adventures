import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setupMobileEventHandlers } from './mobile-setup'
describe('setupMobileEventHandlers', () => {
  beforeEach(() => {
    // Mock window properties and methods
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    })
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 1,
    })
    vi.spyOn(window, 'addEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should set up event handlers for touch-supported devices', () => {
    const mockContext = {
      canvas: document.createElement('canvas'),
    } as unknown as CanvasRenderingContext2D

    setupMobileEventHandlers(mockContext)

    expect(mockContext.canvas.style.width).toBe('100%')
    expect(mockContext.canvas.style.height).toBe('100%')
    expect(mockContext.canvas.width).toBe(800 * (window.devicePixelRatio || 1))
    expect(mockContext.canvas.height).toBe(600 * (window.devicePixelRatio || 1))
    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(window.addEventListener).toHaveBeenCalledWith(
      'touchend',
      expect.any(Function),
    )
  })
})
