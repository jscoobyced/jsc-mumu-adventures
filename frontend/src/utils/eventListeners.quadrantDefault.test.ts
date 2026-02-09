import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock quadrant to return an out-of-range value to hit default branch
vi.mock('./quadrant', () => ({
  getCanvasQuadrant: vi.fn(() => 0),
}))

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

describe('eventListeners quadrant default', () => {
  let touchstartListeners: ((event: TouchEvent) => void)[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    touchstartListeners = []

    window.addEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (event === 'touchstart') {
        touchstartListeners.push(handler as (event: TouchEvent) => void)
      }
    })

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

  it('does nothing when quadrant is out of range (default branch)', () => {
    initializeEventListeners()
    expect(touchstartListeners.length).toBeGreaterThanOrEqual(1)

    const keys = getKeys()
    // ensure keys are false initially
    keys.w.pressed = false
    keys.a.pressed = false
    keys.s.pressed = false
    keys.d.pressed = false
    keys.g.pressed = false
    keys.q.pressed = false

    const event = {
      preventDefault: vi.fn(),
      changedTouches: [{ clientX: 150, clientY: 150 }],
    } as unknown as TouchEvent

    // call handler; quadrant mocked to 0 will hit default
    touchstartListeners[0](event)

    expect(keys.w.pressed).toBe(false)
    expect(keys.a.pressed).toBe(false)
    expect(keys.s.pressed).toBe(false)
    expect(keys.d.pressed).toBe(false)
    expect(keys.g.pressed).toBe(false)
  })
})
