import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getKeys,
  getLastTime,
  initializeEventListeners,
  setLastTime,
} from './eventListeners'

const mockContext = {
  canvas: {
    setAttribute: vi.fn(),
    width: 0,
    height: 0,
    requestFullscreen: vi.fn().mockResolvedValue(undefined),
  },
} as unknown as CanvasRenderingContext2D

const mockGetSegmentNumber = vi.fn().mockReturnValue(0)
vi.mock('../classes/GamePad', () => ({
  getSegmentNumber: (...args: unknown[]) => mockGetSegmentNumber(...args),
}))

vi.mock('./music', () => ({
  startBackgroundAudio: vi.fn().mockResolvedValue(undefined),
  toggleAudio: vi.fn(),
}))

vi.mock('./drawContext', () => ({
  getDrawContext: vi.fn(() => mockContext),
}))

describe('eventListeners', () => {
  let keydownListeners: ((event: KeyboardEvent) => void)[] = []
  let keyupListeners: ((event: KeyboardEvent) => void)[] = []
  let touchstartListeners: ((event: TouchEvent) => void)[] = []
  let touchendListeners: {
    handler: EventListener
    options?: AddEventListenerOptions | boolean
  }[] = []
  let resizeListeners: (() => void)[] = []
  let visibilityListeners: (() => void)[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    keydownListeners = []
    keyupListeners = []
    touchstartListeners = []
    touchendListeners = []
    resizeListeners = []
    visibilityListeners = []

    // Mock window.addEventListener
    window.addEventListener = vi.fn(
      (
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: AddEventListenerOptions | boolean,
      ) => {
        if (event === 'keydown') {
          keydownListeners.push(handler as (event: KeyboardEvent) => void)
        } else if (event === 'keyup') {
          keyupListeners.push(handler as (event: KeyboardEvent) => void)
        } else if (event === 'touchstart') {
          touchstartListeners.push(handler as (event: TouchEvent) => void)
        } else if (event === 'touchend') {
          touchendListeners.push({ handler: handler as EventListener, options })
        } else if (event === 'resize') {
          resizeListeners.push(handler as () => void)
        }
      },
    )

    window.removeEventListener = vi.fn()

    // Mock document.addEventListener
    document.addEventListener = vi.fn((event: string, handler) => {
      if (event === 'visibilitychange') {
        visibilityListeners.push(handler as () => void)
      }
    })

    // Mock document.querySelector to return a canvas-like element
    document.querySelector = vi.fn(() => mockContext.canvas)

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    })

    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(1000)

    // Enable touch support by default
    Object.defineProperty(window, 'ontouchstart', {
      configurable: true,
      value: null,
    })
  })

  describe('getKeys', () => {
    it('should return keys object', () => {
      const keys = getKeys()

      expect(keys).toBeDefined()
      expect(keys).toHaveProperty('w')
      expect(keys).toHaveProperty('a')
      expect(keys).toHaveProperty('s')
      expect(keys).toHaveProperty('d')
      expect(keys).toHaveProperty('g')
      expect(keys).toHaveProperty('q')
      expect(keys).toHaveProperty('space')
      expect(keys).toHaveProperty('spaceEnabled')
    })

    it('should have all keys initially not pressed', () => {
      const keys = getKeys()

      expect(keys.w.pressed).toBe(false)
      expect(keys.a.pressed).toBe(false)
      expect(keys.s.pressed).toBe(false)
      expect(keys.d.pressed).toBe(false)
      expect(keys.g.pressed).toBe(false)
      expect(keys.q.pressed).toBe(false)
      expect(keys.space.pressed).toBe(false)
    })

    it('should have spaceEnabled initially true', () => {
      const keys = getKeys()

      expect(keys.spaceEnabled).toBe(true)
    })
  })

  describe('lastTime', () => {
    it('should get last time', () => {
      const time = getLastTime()

      expect(typeof time).toBe('number')
    })

    it('should set last time', () => {
      setLastTime(5000)

      expect(getLastTime()).toBe(5000)
    })

    it('should update last time with new value', () => {
      setLastTime(1000)
      expect(getLastTime()).toBe(1000)

      setLastTime(2000)
      expect(getLastTime()).toBe(2000)
    })
  })

  describe('initializeEventListeners', () => {
    it('should register keydown listener', () => {
      initializeEventListeners()

      expect(window.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      )
    })

    it('should register keyup listener', () => {
      initializeEventListeners()

      expect(window.addEventListener).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function),
      )
    })

    it('should register visibilitychange listener', () => {
      initializeEventListeners()

      expect(document.addEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      )
    })

    describe('keydown events', () => {
      beforeEach(() => {
        initializeEventListeners()
      })

      it('should set w key pressed on w keydown', () => {
        const event = new KeyboardEvent('keydown', { key: 'w' })
        keydownListeners[0](event)

        expect(getKeys().w.pressed).toBe(true)
      })

      it('should set w key pressed on ArrowUp', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
        keydownListeners[0](event)

        expect(getKeys().w.pressed).toBe(true)
      })

      it('should set a key pressed on a keydown', () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        keydownListeners[0](event)

        expect(getKeys().a.pressed).toBe(true)
      })

      it('should set a key pressed on ArrowLeft', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
        keydownListeners[0](event)

        expect(getKeys().a.pressed).toBe(true)
      })

      it('should set s key pressed on s keydown', () => {
        const event = new KeyboardEvent('keydown', { key: 's' })
        keydownListeners[0](event)

        expect(getKeys().s.pressed).toBe(true)
      })

      it('should set s key pressed on ArrowDown', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        keydownListeners[0](event)

        expect(getKeys().s.pressed).toBe(true)
      })

      it('should set d key pressed on d keydown', () => {
        const event = new KeyboardEvent('keydown', { key: 'd' })
        keydownListeners[0](event)

        expect(getKeys().d.pressed).toBe(true)
      })

      it('should set d key pressed on ArrowRight', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        keydownListeners[0](event)

        expect(getKeys().d.pressed).toBe(true)
      })

      it('should set g key pressed on g keydown', () => {
        const event = new KeyboardEvent('keydown', { key: 'g' })
        keydownListeners[0](event)

        expect(getKeys().g.pressed).toBe(true)
      })

      it('should set q key pressed on q keydown', () => {
        const event = new KeyboardEvent('keydown', { key: 'q' })
        keydownListeners[0](event)

        expect(getKeys().q.pressed).toBe(true)
      })

      it('should set space key pressed when spaceEnabled', () => {
        getKeys().spaceEnabled = true
        const event = new KeyboardEvent('keydown', { key: ' ' })
        keydownListeners[0](event)

        expect(getKeys().space.pressed).toBe(true)
      })

      it('should not set space key pressed when not spaceEnabled', () => {
        const keys = getKeys()
        keys.spaceEnabled = false
        keys.space.pressed = false

        const event = new KeyboardEvent('keydown', { key: ' ' })
        keydownListeners[0](event)

        expect(keys.space.pressed).toBe(false)
      })

      it('should toggle audio on q keydown', async () => {
        const { toggleAudio } = await import('./music')
        const event = new KeyboardEvent('keydown', { key: 'q' })
        keydownListeners[0](event)

        expect(toggleAudio).toHaveBeenCalledWith(getKeys())
      })

      it('should start background audio on any keydown', async () => {
        const { startBackgroundAudio } = await import('./music')
        const event = new KeyboardEvent('keydown', { key: 'w' })
        keydownListeners[0](event)

        expect(startBackgroundAudio).toHaveBeenCalled()
      })

      it('should log error when startBackgroundAudio rejects', async () => {
        const { startBackgroundAudio } = await import('./music')
        const error = new Error('audio failed')
        vi.mocked(startBackgroundAudio).mockRejectedValueOnce(error)
        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})

        const event = new KeyboardEvent('keydown', { key: 'w' })
        keydownListeners[0](event)

        // Wait for the promise rejection to be handled
        await vi.waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith(
            'Error starting background audio:',
            error,
          )
        })
      })

      it('should handle unknown keys without error', () => {
        const event = new KeyboardEvent('keydown', { key: 'x' })

        expect(() => keydownListeners[0](event)).not.toThrow()
      })
    })

    describe('keyup events', () => {
      beforeEach(() => {
        initializeEventListeners()
      })

      it('should unset w key on w keyup', () => {
        getKeys().w.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'w' })
        keyupListeners[0](event)

        expect(getKeys().w.pressed).toBe(false)
      })

      it('should unset w key on ArrowUp keyup', () => {
        getKeys().w.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'ArrowUp' })
        keyupListeners[0](event)

        expect(getKeys().w.pressed).toBe(false)
      })

      it('should unset a key on a keyup', () => {
        getKeys().a.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'a' })
        keyupListeners[0](event)

        expect(getKeys().a.pressed).toBe(false)
      })

      it('should unset a key on ArrowLeft keyup', () => {
        getKeys().a.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' })
        keyupListeners[0](event)

        expect(getKeys().a.pressed).toBe(false)
      })

      it('should unset s key on s keyup', () => {
        getKeys().s.pressed = true
        const event = new KeyboardEvent('keyup', { key: 's' })
        keyupListeners[0](event)

        expect(getKeys().s.pressed).toBe(false)
      })

      it('should unset s key on ArrowDown keyup', () => {
        getKeys().s.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'ArrowDown' })
        keyupListeners[0](event)

        expect(getKeys().s.pressed).toBe(false)
      })

      it('should unset d key on d keyup', () => {
        getKeys().d.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'd' })
        keyupListeners[0](event)

        expect(getKeys().d.pressed).toBe(false)
      })

      it('should unset d key on ArrowRight keyup', () => {
        getKeys().d.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'ArrowRight' })
        keyupListeners[0](event)

        expect(getKeys().d.pressed).toBe(false)
      })

      it('should unset g key on g keyup', () => {
        getKeys().g.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'g' })
        keyupListeners[0](event)

        expect(getKeys().g.pressed).toBe(false)
      })

      it('should unset q key on q keyup', () => {
        getKeys().q.pressed = true
        const event = new KeyboardEvent('keyup', { key: 'q' })
        keyupListeners[0](event)

        expect(getKeys().q.pressed).toBe(false)
      })

      it('should handle unknown keys without error', () => {
        const event = new KeyboardEvent('keyup', { key: 'x' })

        expect(() => keyupListeners[0](event)).not.toThrow()
      })
    })

    describe('visibilitychange events', () => {
      beforeEach(() => {
        initializeEventListeners()
      })

      it('should reset lastTime when document becomes visible', () => {
        vi.spyOn(performance, 'now').mockReturnValue(5000)
        Object.defineProperty(document, 'hidden', {
          configurable: true,
          get: () => false,
        })

        visibilityListeners[0]()

        expect(getLastTime()).toBe(5000)
      })

      it('should not reset lastTime when document is hidden', () => {
        const originalTime = getLastTime()
        vi.spyOn(performance, 'now').mockReturnValue(5000)
        Object.defineProperty(document, 'hidden', {
          configurable: true,
          get: () => true,
        })

        visibilityListeners[0]()

        expect(getLastTime()).toBe(originalTime)
      })
    })

    describe('touchend events', () => {
      beforeEach(() => {
        initializeEventListeners()
      })

      it('should register touchend listener with passive false', () => {
        // First touchend is the key-reset handler (passive: false)
        expect(touchendListeners.length).toBeGreaterThanOrEqual(1)
        const hasPassiveFalse = touchendListeners.some((t) => {
          const opts = t.options
          if (typeof opts === 'boolean' || opts === undefined) return false
          return (opts as AddEventListenerOptions).passive === false
        })
        expect(hasPassiveFalse).toBe(true)
      })

      it('should reset all movement keys on touchend', () => {
        const keys = getKeys()
        keys.w.pressed = true
        keys.a.pressed = true
        keys.s.pressed = true
        keys.d.pressed = true
        keys.g.pressed = true

        const event = { preventDefault: vi.fn() } as unknown as TouchEvent
        touchendListeners[0].handler(event)

        expect(keys.w.pressed).toBe(false)
        expect(keys.a.pressed).toBe(false)
        expect(keys.s.pressed).toBe(false)
        expect(keys.d.pressed).toBe(false)
        expect(keys.g.pressed).toBe(false)
        expect(event.preventDefault).toHaveBeenCalled()
      })
    })

    describe('touchstart events', () => {
      const createTouchEvent = (clientX: number, clientY: number) =>
        ({
          preventDefault: vi.fn(),
          changedTouches: [{ clientX, clientY }],
        }) as unknown as TouchEvent

      beforeEach(() => {
        initializeEventListeners()
      })

      it('should register touchstart listener', () => {
        expect(touchstartListeners.length).toBe(1)
      })

      it('should set w and a keys for quadrant 7 (Up-Left)', () => {
        mockGetSegmentNumber.mockReturnValue(7)
        touchstartListeners[0](createTouchEvent(10, 10))

        const keys = getKeys()
        expect(keys.w.pressed).toBe(true)
        expect(keys.a.pressed).toBe(true)
      })

      it('should set w key for quadrant 8 (Up)', () => {
        mockGetSegmentNumber.mockReturnValue(8)
        touchstartListeners[0](createTouchEvent(10, 10))

        expect(getKeys().w.pressed).toBe(true)
      })

      it('should set w and d keys for quadrant 9 (Up-Right)', () => {
        mockGetSegmentNumber.mockReturnValue(9)
        touchstartListeners[0](createTouchEvent(10, 10))

        const keys = getKeys()
        expect(keys.w.pressed).toBe(true)
        expect(keys.d.pressed).toBe(true)
      })

      it('should set a key for quadrant 4 (Left)', () => {
        mockGetSegmentNumber.mockReturnValue(4)
        touchstartListeners[0](createTouchEvent(10, 10))

        expect(getKeys().a.pressed).toBe(true)
      })

      it('should set g key for quadrant 5 (Center)', () => {
        mockGetSegmentNumber.mockReturnValue(5)
        touchstartListeners[0](createTouchEvent(10, 10))

        expect(getKeys().g.pressed).toBe(true)
      })

      it('should set d key for quadrant 6 (Right)', () => {
        mockGetSegmentNumber.mockReturnValue(6)
        touchstartListeners[0](createTouchEvent(10, 10))

        expect(getKeys().d.pressed).toBe(true)
      })

      it('should set s and a keys for quadrant 1 (Down-Left)', () => {
        mockGetSegmentNumber.mockReturnValue(1)
        touchstartListeners[0](createTouchEvent(10, 10))

        const keys = getKeys()
        expect(keys.s.pressed).toBe(true)
        expect(keys.a.pressed).toBe(true)
      })

      it('should set s key for quadrant 2 (Down)', () => {
        mockGetSegmentNumber.mockReturnValue(2)
        touchstartListeners[0](createTouchEvent(10, 10))

        expect(getKeys().s.pressed).toBe(true)
      })

      it('should set s and d keys for quadrant 3 (Down-Right)', () => {
        mockGetSegmentNumber.mockReturnValue(3)
        touchstartListeners[0](createTouchEvent(10, 10))

        const keys = getKeys()
        expect(keys.s.pressed).toBe(true)
        expect(keys.d.pressed).toBe(true)
      })

      it('should not set any keys for quadrant 0 (outside)', () => {
        const keys = getKeys()
        keys.w.pressed = false
        keys.a.pressed = false
        keys.s.pressed = false
        keys.d.pressed = false
        keys.g.pressed = false

        mockGetSegmentNumber.mockReturnValue(0)
        touchstartListeners[0](createTouchEvent(10, 10))

        expect(keys.w.pressed).toBe(false)
        expect(keys.a.pressed).toBe(false)
        expect(keys.s.pressed).toBe(false)
        expect(keys.d.pressed).toBe(false)
        expect(keys.g.pressed).toBe(false)
      })

      it('should call preventDefault on touch event', () => {
        mockGetSegmentNumber.mockReturnValue(0)
        const event = createTouchEvent(10, 10)
        touchstartListeners[0](event)

        expect(event.preventDefault).toHaveBeenCalled()
      })
    })

    describe('touch support', () => {
      it('should set canvas style and dimensions when touch supported', () => {
        initializeEventListeners()

        expect(mockContext.canvas.setAttribute).toHaveBeenCalledWith(
          'style',
          'width: 100%; height: 100%;',
        )
      })

      it('should register resize listener when touch supported', () => {
        initializeEventListeners()

        expect(resizeListeners.length).toBeGreaterThanOrEqual(1)
      })

      it('should register handleTap touchend listener when touch supported', () => {
        initializeEventListeners()

        // Second touchend is the handleTap listener
        expect(touchendListeners.length).toBeGreaterThanOrEqual(2)
      })

      it('should not set up canvas handlers when getDrawContext returns null', async () => {
        const { getDrawContext } = await import('./drawContext')
        vi.mocked(getDrawContext).mockReturnValueOnce(null)

        initializeEventListeners()

        expect(resizeListeners.length).toBe(0)
      })
    })

    describe('handleTap', () => {
      beforeEach(() => {
        initializeEventListeners()
      })

      it('should request fullscreen, start audio and set space pressed', async () => {
        const { startBackgroundAudio } = await import('./music')

        // handleTap is the second touchend listener
        const handleTap = touchendListeners[1].handler
        await (handleTap as () => Promise<void>)()

        expect(mockContext.canvas.requestFullscreen).toHaveBeenCalled()
        expect(startBackgroundAudio).toHaveBeenCalled()
        expect(getKeys().space.pressed).toBe(true)
        expect(window.removeEventListener).toHaveBeenCalledWith(
          'touchend',
          handleTap,
        )
      })
    })

    describe('handleResize', () => {
      beforeEach(() => {
        initializeEventListeners()
      })

      it('should update canvas dimensions on resize', () => {
        Object.defineProperty(window, 'innerWidth', {
          configurable: true,
          value: 800,
        })
        Object.defineProperty(window, 'innerHeight', {
          configurable: true,
          value: 600,
        })

        resizeListeners[0]()

        expect(mockContext.canvas.width).toBe(800)
        expect(mockContext.canvas.height).toBe(600)
        expect(mockContext.canvas.setAttribute).toHaveBeenCalledWith(
          'style',
          'width: 100%; height: 100%;',
        )
      })
    })
  })
})
