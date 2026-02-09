import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./music', () => ({
  startBackgroundAudio: vi.fn().mockResolvedValue(undefined),
  toggleAudio: vi.fn(),
}))

const mockContext = {
  canvas: {
    setAttribute: vi.fn(),
    width: 300,
    height: 300,
    requestFullscreen: vi.fn().mockResolvedValue(undefined),
  },
} as unknown as CanvasRenderingContext2D

vi.mock('./drawContext', () => ({
  getDrawContext: vi.fn(() => mockContext),
  dpr: 1,
}))

import { initializeEventListeners, getKeys } from './eventListeners'

describe('eventListeners touchstart mapping', () => {
  let touchstartListeners: ((event: TouchEvent) => void)[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    touchstartListeners = []

    window.addEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (event === 'touchstart') {
        touchstartListeners.push(handler as (event: TouchEvent) => void)
      }
    })

    // ensure touch support and predictable screen size
    Object.defineProperty(window, 'ontouchstart', {
      configurable: true,
      value: null,
    })
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 300,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 300,
    })
  })

  it('maps touch positions to the correct movement keys', () => {
    initializeEventListeners()

    expect(touchstartListeners.length).toBeGreaterThanOrEqual(1)

    const cases = [
      { x: 10, y: 10, expected: { w: true, a: true, s: false, d: false, g: false } },
      { x: 150, y: 10, expected: { w: true, a: false, s: false, d: false, g: false } },
      { x: 290, y: 10, expected: { w: true, a: false, s: false, d: true, g: false } },
      { x: 10, y: 150, expected: { w: false, a: true, s: false, d: false, g: false } },
      { x: 150, y: 150, expected: { w: false, a: false, s: false, d: false, g: true } },
      { x: 290, y: 150, expected: { w: false, a: false, s: false, d: true, g: false } },
      { x: 10, y: 290, expected: { w: false, a: true, s: true, d: false, g: false } },
      { x: 150, y: 290, expected: { w: false, a: false, s: true, d: false, g: false } },
      { x: 290, y: 290, expected: { w: false, a: false, s: true, d: true, g: false } },
    ]

    for (const c of cases) {
      const keys = getKeys()
      // reset keys
      keys.w.pressed = false
      keys.a.pressed = false
      keys.s.pressed = false
      keys.d.pressed = false
      keys.g.pressed = false
      keys.q.pressed = false

      const event = {
        preventDefault: vi.fn(),
        changedTouches: [{ clientX: c.x, clientY: c.y }],
      } as unknown as TouchEvent

      // call the first registered touchstart handler
      touchstartListeners[0](event)

      // assertions
      expect(getKeys().w.pressed).toBe(c.expected.w)
      expect(getKeys().a.pressed).toBe(c.expected.a)
      expect(getKeys().s.pressed).toBe(c.expected.s)
      expect(getKeys().d.pressed).toBe(c.expected.d)
      expect(getKeys().g.pressed).toBe(c.expected.g)
    }
  })
})
