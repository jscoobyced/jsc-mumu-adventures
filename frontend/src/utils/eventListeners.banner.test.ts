import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetDrawContext = vi.fn()

vi.mock('./drawContext', () => ({
  getDrawContext: mockGetDrawContext,
}))

vi.mock('./device', () => ({
  isMobile: false,
  isTouchSupported: false,
  getDevicePixelRatio: vi.fn(() => 1),
}))

describe('handleBannerTouch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('does nothing when canvas is unavailable', async () => {
    mockGetDrawContext.mockReturnValue(null)
    const { handleBannerTouch } = await import('./eventListeners')
    const banner = {
      checkBannerTouched: vi.fn(),
      draw: vi.fn(),
    }

    handleBannerTouch(banner as never)

    expect(banner.checkBannerTouched).not.toHaveBeenCalled()
    expect(banner.draw).not.toHaveBeenCalled()
  })

  it('registers click and touchend listeners on canvas', async () => {
    const canvas = {
      addEventListener: vi.fn(),
    }
    mockGetDrawContext.mockReturnValue({ canvas })
    const { handleBannerTouch } = await import('./eventListeners')
    const banner = {
      checkBannerTouched: vi.fn(() => false),
      draw: vi.fn(),
    }

    handleBannerTouch(banner as never)

    expect(canvas.addEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
    )
    expect(canvas.addEventListener).toHaveBeenCalledWith(
      'touchend',
      expect.any(Function),
    )
  })

  it('checks banner touch coordinates on touchend', async () => {
    const listeners: Record<string, (event: unknown) => void> = {}
    const canvas = {
      addEventListener: vi.fn(
        (type: string, handler: (event: unknown) => void) => {
          listeners[type] = handler
        },
      ),
    }
    const context = { canvas }
    mockGetDrawContext.mockReturnValue(context)
    const { handleBannerTouch } = await import('./eventListeners')
    const banner = {
      checkBannerTouched: vi.fn(() => true),
      draw: vi.fn(),
    }

    handleBannerTouch(banner as never)
    listeners.touchend({
      changedTouches: [{ clientX: 20, clientY: 30 }],
    })

    expect(banner.checkBannerTouched).toHaveBeenCalledWith(20, 30)
  })

  it('does not draw banner on touchend when touch is outside', async () => {
    const listeners: Record<string, (event: unknown) => void> = {}
    const canvas = {
      addEventListener: vi.fn(
        (type: string, handler: (event: unknown) => void) => {
          listeners[type] = handler
        },
      ),
    }
    mockGetDrawContext.mockReturnValue({ canvas })
    const { handleBannerTouch } = await import('./eventListeners')
    const banner = {
      checkBannerTouched: vi.fn(() => false),
      draw: vi.fn(),
    }

    handleBannerTouch(banner as never)
    listeners.touchend({
      changedTouches: [{ clientX: 10, clientY: 15 }],
    })

    expect(banner.checkBannerTouched).toHaveBeenCalledWith(10, 15)
    expect(banner.draw).not.toHaveBeenCalled()
  })
})
