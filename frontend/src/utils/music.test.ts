import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Keys } from '../models/Keys'

vi.mock('../config.json', () => ({
  default: {
    audio: {
      backgroundMusic: './test-music.mp3',
    },
  },
}))

describe('music', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Audio constructor that auto-triggers oncanplaythrough
    global.Audio = class MockAudio {
      src = ''
      loop = false
      volume = 1
      paused = true
      play = vi.fn().mockResolvedValue(undefined)
      pause = vi.fn()
      oncanplaythrough: ((this: HTMLAudioElement, ev: Event) => unknown) | null =
        null
      onerror: OnErrorEventHandler = null

      constructor() {
        // Auto-set properties when src is assigned
        setTimeout(() => {
          if (this.oncanplaythrough) {
            this.oncanplaythrough.call(
              this as unknown as HTMLAudioElement,
              new Event('canplaythrough'),
            )
          }
        }, 0)
      }
    } as unknown as typeof Audio
  })

  describe('loadAudio', () => {
    it('should load audio with correct properties', async () => {
      const { loadAudio } = await import('./music')
      
      const audio = await loadAudio('./test.mp3')

      expect(audio).toBeDefined()
      expect(audio.loop).toBe(true)
      expect(audio.volume).toBe(0.5)
    })

    it('should set correct src', async () => {
      const { loadAudio } = await import('./music')
      
      const audio = await loadAudio('./my-music.mp3')

      expect(audio.src).toBe('./my-music.mp3')
    })
  })

  describe('hasBackgroundAudioStarted', () => {
    it('should return boolean', async () => {
      const { hasBackgroundAudioStarted } = await import('./music')
      
      const result = hasBackgroundAudioStarted()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('stopCurrentAudio', () => {
    it('should not throw error', async () => {
      const { stopCurrentAudio } = await import('./music')
      
      expect(() => stopCurrentAudio()).not.toThrow()
    })
  })

  describe('toggleAudio', () => {
    const createMockKeys = (): Keys => ({
      w: { pressed: false },
      a: { pressed: false },
      s: { pressed: false },
      d: { pressed: false },
      g: { pressed: false },
      q: { pressed: false },
      space: { pressed: false },
      spaceEnabled: false,
    })

    it('should reset q.pressed to false when q is pressed', async () => {
      const { toggleAudio } = await import('./music')
      const keys = createMockKeys()
      keys.q.pressed = true

      toggleAudio(keys)

      expect(keys.q.pressed).toBe(false)
    })

    it('should not change q.pressed when it is false', async () => {
      const { toggleAudio } = await import('./music')
      const keys = createMockKeys()
      keys.q.pressed = false

      toggleAudio(keys)

      expect(keys.q.pressed).toBe(false)
    })

    it('should not throw when no audio exists', async () => {
      const { toggleAudio } = await import('./music')
      const keys = createMockKeys()
      keys.q.pressed = true

      expect(() => toggleAudio(keys)).not.toThrow()
    })
  })
})


