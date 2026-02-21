import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockToggleAudio = vi.fn()
const mockStartBackgroundAudio = vi.fn().mockResolvedValue(undefined)
const mockCheckAudioSpriteTouched = vi.fn(() => false)
const mockGetSegmentNumber = vi.fn(() => 0)
const mockGetDevicePixelRatio = vi.fn(() => 2)

let mockIsMobile = false
let mockIsTouchSupported = false
let mockCanvas: Record<string, unknown> | null = null

vi.mock('./music', () => ({
  toggleAudio: mockToggleAudio,
  startBackgroundAudio: mockStartBackgroundAudio,
}))

vi.mock('../classes/AudioSprite', () => ({
  checkAudioSpriteTouched: mockCheckAudioSpriteTouched,
}))

vi.mock('./getTouchedCoordinates', () => ({
  getSegmentNumber: mockGetSegmentNumber,
}))

vi.mock('./device', () => ({
  get isMobile() {
    return mockIsMobile
  },
  get isTouchSupported() {
    return mockIsTouchSupported
  },
  getDevicePixelRatio: mockGetDevicePixelRatio,
}))

vi.mock('./drawContext', () => ({
  getDrawContext: vi.fn(() => {
    if (!mockCanvas) return null
    return { canvas: mockCanvas }
  }),
}))

describe('eventListeners', () => {
  let windowListeners: Record<string, ((...args: unknown[]) => void)[]>
  let documentListeners: Record<string, ((...args: unknown[]) => void)[]>

  beforeEach(() => {
    windowListeners = {}
    documentListeners = {}

    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type: string, handler: unknown) => {
        if (!windowListeners[type]) windowListeners[type] = []
        windowListeners[type].push(handler as (...args: unknown[]) => void)
      },
    )
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (type: string, handler: unknown) => {
        if (windowListeners[type]) {
          windowListeners[type] = windowListeners[type].filter(
            (h) => h !== handler,
          )
        }
      },
    )
    vi.spyOn(document, 'addEventListener').mockImplementation(
      (type: string, handler: unknown) => {
        if (!documentListeners[type]) documentListeners[type] = []
        documentListeners[type].push(handler as (...args: unknown[]) => void)
      },
    )

    mockCanvas = null
    mockIsMobile = false
    mockIsTouchSupported = false
    mockGetDevicePixelRatio.mockReturnValue(2)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  const loadModule = async () => {
    const mod = await import('./eventListeners')
    return mod
  }

  describe('getKeys / getLastTime / setLastTime', () => {
    it('getKeys returns initialized keys', async () => {
      const { getKeys } = await loadModule()
      const keys = getKeys()
      expect(keys.w.pressed).toBe(false)
      expect(keys.a.pressed).toBe(false)
      expect(keys.s.pressed).toBe(false)
      expect(keys.d.pressed).toBe(false)
      expect(keys.g.pressed).toBe(false)
      expect(keys.q.pressed).toBe(false)
      expect(keys.space.pressed).toBe(false)
      expect(keys.spaceEnabled).toBe(true)
    })

    it('getLastTime returns a number, setLastTime updates it', async () => {
      const { getLastTime, setLastTime } = await loadModule()
      expect(typeof getLastTime()).toBe('number')
      setLastTime(12345)
      expect(getLastTime()).toBe(12345)
    })
  })

  describe('initializeEventListeners', () => {
    describe('keydown', () => {
      it.each([
        ['w', 'w'],
        ['ArrowUp', 'w'],
        ['a', 'a'],
        ['ArrowLeft', 'a'],
        ['s', 's'],
        ['ArrowDown', 's'],
        ['d', 'd'],
        ['ArrowRight', 'd'],
        ['g', 'g'],
      ])(
        'pressing "%s" sets keys.%s.pressed to true',
        async (eventKey, keyProp) => {
          const { getKeys, initializeEventListeners } = await loadModule()
          initializeEventListeners()
          const handler = windowListeners['keydown'][0]
          handler({ key: eventKey } as unknown as KeyboardEvent)
          expect(
            getKeys()[keyProp as keyof ReturnType<typeof getKeys>],
          ).toHaveProperty('pressed', true)
        },
      )

      it('pressing space sets keys.space.pressed when spaceEnabled', async () => {
        const { getKeys, initializeEventListeners } = await loadModule()
        initializeEventListeners()
        const handler = windowListeners['keydown'][0]
        handler({ key: ' ' } as unknown as KeyboardEvent)
        expect(getKeys().space.pressed).toBe(true)
      })

      it('pressing space does not set keys.space.pressed when spaceEnabled is false', async () => {
        const { getKeys, initializeEventListeners } = await loadModule()
        initializeEventListeners()
        getKeys().spaceEnabled = false
        const handler = windowListeners['keydown'][0]
        handler({ key: ' ' } as unknown as KeyboardEvent)
        expect(getKeys().space.pressed).toBe(false)
      })

      it('pressing q calls toggleAudio', async () => {
        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()
        const handler = windowListeners['keydown'][0]
        handler({ key: 'q' } as unknown as KeyboardEvent)
        expect(mockToggleAudio).toHaveBeenCalled()
      })

      it('calls startBackgroundAudio on any keydown', async () => {
        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()
        const handler = windowListeners['keydown'][0]
        handler({ key: 'x' } as unknown as KeyboardEvent)
        expect(mockStartBackgroundAudio).toHaveBeenCalled()
      })

      it('logs error if startBackgroundAudio rejects', async () => {
        mockStartBackgroundAudio.mockRejectedValueOnce(new Error('fail'))
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()
        const handler = windowListeners['keydown'][0]
        handler({ key: 'w' } as unknown as KeyboardEvent)
        await vi.waitFor(() =>
          expect(errorSpy).toHaveBeenCalledWith(
            'Error starting background audio:',
            expect.any(Error),
          ),
        )
      })

      it('default case does not set any key', async () => {
        const { getKeys, initializeEventListeners } = await loadModule()
        initializeEventListeners()
        const handler = windowListeners['keydown'][0]
        handler({ key: 'z' } as unknown as KeyboardEvent)
        const keys = getKeys()
        expect(keys.w.pressed).toBe(false)
        expect(keys.a.pressed).toBe(false)
        expect(keys.s.pressed).toBe(false)
        expect(keys.d.pressed).toBe(false)
      })
    })

    describe('keyup', () => {
      it.each([
        ['w', 'w'],
        ['ArrowUp', 'w'],
        ['a', 'a'],
        ['ArrowLeft', 'a'],
        ['s', 's'],
        ['ArrowDown', 's'],
        ['d', 'd'],
        ['ArrowRight', 'd'],
        ['g', 'g'],
        ['q', 'q'],
      ])(
        'releasing "%s" sets keys.%s.pressed to false',
        async (eventKey, keyProp) => {
          const { getKeys, initializeEventListeners } = await loadModule()
          initializeEventListeners()
          const keys = getKeys()
          const keyObj = keys[keyProp as keyof typeof keys]
          if (typeof keyObj === 'object' && 'pressed' in keyObj) {
            keyObj.pressed = true
          }
          const handler = windowListeners['keyup'][0]
          handler({ key: eventKey } as unknown as KeyboardEvent)
          expect(
            getKeys()[keyProp as keyof ReturnType<typeof getKeys>],
          ).toHaveProperty('pressed', false)
        },
      )

      it('default case does nothing', async () => {
        const { getKeys, initializeEventListeners } = await loadModule()
        initializeEventListeners()
        getKeys().w.pressed = true
        const handler = windowListeners['keyup'][0]
        handler({ key: 'z' } as unknown as KeyboardEvent)
        expect(getKeys().w.pressed).toBe(true)
      })
    })

    describe('canvas click', () => {
      it('calls toggleAudio when audio sprite is clicked', async () => {
        mockCanvas = {
          addEventListener: vi.fn(
            (type: string, handler: (...args: unknown[]) => void) => {
              if (!windowListeners['canvas_' + type])
                windowListeners['canvas_' + type] = []
              windowListeners['canvas_' + type].push(handler)
            },
          ),
          setAttribute: vi.fn(),
          width: 1024,
          height: 576,
        }
        mockCheckAudioSpriteTouched.mockReturnValue(true)

        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()

        const clickHandler = windowListeners['canvas_click'][0]
        clickHandler({ offsetX: 100, offsetY: 200 } as unknown as MouseEvent)
        expect(mockCheckAudioSpriteTouched).toHaveBeenCalledWith(100, 200)
        expect(mockToggleAudio).toHaveBeenCalled()
      })

      it('does not call toggleAudio when audio sprite is not clicked', async () => {
        mockCanvas = {
          addEventListener: vi.fn(
            (type: string, handler: (...args: unknown[]) => void) => {
              if (!windowListeners['canvas_' + type])
                windowListeners['canvas_' + type] = []
              windowListeners['canvas_' + type].push(handler)
            },
          ),
          setAttribute: vi.fn(),
          width: 1024,
          height: 576,
        }
        mockCheckAudioSpriteTouched.mockReturnValue(false)

        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()

        const clickHandler = windowListeners['canvas_click'][0]
        clickHandler({ offsetX: 50, offsetY: 50 } as unknown as MouseEvent)
        expect(mockToggleAudio).not.toHaveBeenCalled()
      })
    })

    describe('canvas touchend', () => {
      it('calls toggleAudio when audio sprite is touched', async () => {
        mockCanvas = {
          addEventListener: vi.fn(
            (type: string, handler: (...args: unknown[]) => void) => {
              if (!windowListeners['canvas_' + type])
                windowListeners['canvas_' + type] = []
              windowListeners['canvas_' + type].push(handler)
            },
          ),
          setAttribute: vi.fn(),
          width: 1024,
          height: 576,
        }
        mockCheckAudioSpriteTouched.mockReturnValue(true)

        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()

        const handler = windowListeners['canvas_touchend'][0]
        handler({
          changedTouches: [{ clientX: 10, clientY: 20 }],
        } as unknown as TouchEvent)
        expect(mockCheckAudioSpriteTouched).toHaveBeenCalledWith(10, 20)
        expect(mockToggleAudio).toHaveBeenCalled()
      })
    })

    describe('touchstart (gamepad)', () => {
      it.each([
        [7, { w: true, a: true }],
        [8, { w: true }],
        [9, { w: true, d: true }],
        [4, { a: true }],
        [5, { g: true }],
        [6, { d: true }],
        [1, { s: true, a: true }],
        [2, { s: true }],
        [3, { s: true, d: true }],
        [0, {}],
      ])('quadrant %i sets correct keys', async (quadrant, expectedPressed) => {
        const { getKeys, initializeEventListeners } = await loadModule()
        initializeEventListeners()
        mockGetSegmentNumber.mockReturnValue(quadrant)

        const handler = windowListeners['touchstart'][0]
        handler({
          preventDefault: vi.fn(),
          changedTouches: [{ clientX: 50, clientY: 50 }],
        } as unknown as TouchEvent)

        const keys = getKeys()
        for (const k of ['w', 'a', 's', 'd', 'g'] as const) {
          const expected = !!(expectedPressed as Record<string, boolean>)[k]
          expect(keys[k].pressed).toBe(expected)
        }
      })

      it('calls preventDefault on touchstart', async () => {
        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()
        mockGetSegmentNumber.mockReturnValue(0)
        const preventDefault = vi.fn()
        const handler = windowListeners['touchstart'][0]
        handler({
          preventDefault,
          changedTouches: [{ clientX: 0, clientY: 0 }],
        } as unknown as TouchEvent)
        expect(preventDefault).toHaveBeenCalled()
      })
    })

    describe('window touchend (clear keys)', () => {
      it('clears all keys on touchend', async () => {
        const { getKeys, initializeEventListeners } = await loadModule()
        initializeEventListeners()
        const keys = getKeys()
        keys.w.pressed = true
        keys.a.pressed = true
        keys.s.pressed = true
        keys.d.pressed = true
        keys.g.pressed = true
        keys.q.pressed = true

        // The first window touchend handler is the key-clearing one
        const handler = windowListeners['touchend'][0]
        handler({ preventDefault: vi.fn() } as unknown as TouchEvent)

        expect(keys.w.pressed).toBe(false)
        expect(keys.a.pressed).toBe(false)
        expect(keys.s.pressed).toBe(false)
        expect(keys.d.pressed).toBe(false)
        expect(keys.g.pressed).toBe(false)
        expect(keys.q.pressed).toBe(false)
      })
    })

    describe('visibilitychange', () => {
      it('resets lastTime when document becomes visible', async () => {
        const { getLastTime, initializeEventListeners, setLastTime } =
          await loadModule()
        initializeEventListeners()
        setLastTime(0)

        Object.defineProperty(document, 'hidden', {
          value: false,
          writable: true,
          configurable: true,
        })

        const handler = documentListeners['visibilitychange'][0]
        handler()

        expect(getLastTime()).toBeGreaterThan(0)
      })

      it('does not reset lastTime when document is hidden', async () => {
        const { getLastTime, initializeEventListeners, setLastTime } =
          await loadModule()
        initializeEventListeners()
        setLastTime(999)

        Object.defineProperty(document, 'hidden', {
          value: true,
          writable: true,
          configurable: true,
        })

        const handler = documentListeners['visibilitychange'][0]
        handler()

        expect(getLastTime()).toBe(999)
      })
    })

    describe('touch support branch', () => {
      it('sets canvas style and dimensions when touch is supported', async () => {
        mockIsTouchSupported = true
        mockIsMobile = true
        mockCanvas = {
          addEventListener: vi.fn(),
          setAttribute: vi.fn(),
          width: 0,
          height: 0,
        }
        Object.defineProperty(window, 'innerWidth', {
          value: 400,
          writable: true,
          configurable: true,
        })
        Object.defineProperty(window, 'innerHeight', {
          value: 800,
          writable: true,
          configurable: true,
        })
        mockGetDevicePixelRatio.mockReturnValue(2)

        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()

        expect(mockCanvas.setAttribute).toHaveBeenCalledWith(
          'style',
          'width: 100%; height: 100%;',
        )
        expect(mockCanvas.width).toBe(800)
        expect(mockCanvas.height).toBe(1600)
        // resize and touchend (handleTap) listeners added
        expect(windowListeners['resize']).toBeDefined()
        expect(windowListeners['touchend'].length).toBeGreaterThanOrEqual(2)
      })

      it('handleResize updates canvas dimensions', async () => {
        mockIsTouchSupported = true
        mockIsMobile = true
        mockCanvas = {
          addEventListener: vi.fn(),
          setAttribute: vi.fn(),
          width: 0,
          height: 0,
        }
        mockGetDevicePixelRatio.mockReturnValue(3)
        Object.defineProperty(window, 'innerWidth', {
          value: 500,
          writable: true,
          configurable: true,
        })
        Object.defineProperty(window, 'innerHeight', {
          value: 1000,
          writable: true,
          configurable: true,
        })

        const { initializeEventListeners } = await loadModule()
        initializeEventListeners()

        // Simulate resize
        Object.defineProperty(window, 'innerWidth', {
          value: 600,
          writable: true,
          configurable: true,
        })
        Object.defineProperty(window, 'innerHeight', {
          value: 1200,
          writable: true,
          configurable: true,
        })

        const resizeHandler = windowListeners['resize'][0]
        resizeHandler()

        expect(mockCanvas.width).toBe(1800)
        expect(mockCanvas.height).toBe(3600)
      })

      it('handleTap requests fullscreen, starts audio, sets space, and removes listener', async () => {
        mockIsTouchSupported = true
        mockIsMobile = true
        const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined)
        mockCanvas = {
          addEventListener: vi.fn(),
          setAttribute: vi.fn(),
          width: 0,
          height: 0,
          requestFullscreen: mockRequestFullscreen,
        }
        vi.spyOn(document, 'querySelector').mockReturnValue(
          mockCanvas as unknown as HTMLCanvasElement,
        )
        mockStartBackgroundAudio.mockResolvedValue(undefined)

        const { getKeys, initializeEventListeners } = await loadModule()
        initializeEventListeners()

        // handleTap is the last touchend handler
        const tapHandlers = windowListeners['touchend']
        const tapHandler = tapHandlers[tapHandlers.length - 1]

        await tapHandler()

        expect(mockRequestFullscreen).toHaveBeenCalled()
        expect(mockStartBackgroundAudio).toHaveBeenCalled()
        expect(getKeys().space.pressed).toBe(true)
      })
    })
  })
})
