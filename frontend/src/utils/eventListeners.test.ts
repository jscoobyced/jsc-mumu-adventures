import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getKeys,
  getLastTime,
  initializeEventListeners,
  setLastTime,
} from './eventListeners'

vi.mock('./music', () => ({
  startBackgroundAudio: vi.fn().mockResolvedValue(undefined),
  toggleAudio: vi.fn(),
}))

describe('eventListeners', () => {
  let keydownListeners: ((event: KeyboardEvent) => void)[] = []
  let keyupListeners: ((event: KeyboardEvent) => void)[] = []
  let visibilityListeners: (() => void)[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    keydownListeners = []
    keyupListeners = []
    visibilityListeners = []

    // Mock window.addEventListener
    window.addEventListener = vi.fn((event: string, handler) => {
      if (event === 'keydown') {
        keydownListeners.push(handler as (event: KeyboardEvent) => void)
      } else if (event === 'keyup') {
        keyupListeners.push(handler as (event: KeyboardEvent) => void)
      }
    })

    // Mock document.addEventListener
    document.addEventListener = vi.fn((event: string, handler) => {
      if (event === 'visibilitychange') {
        visibilityListeners.push(handler as () => void)
      }
    })

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    })

    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(1000)
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
  })
})
