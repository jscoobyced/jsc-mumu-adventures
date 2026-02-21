import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  paused: true,
  play: vi.fn(async () => {
    mocks.paused = false
  }),
  pause: vi.fn(() => {
    mocks.paused = true
  }),
  loadAudio: vi.fn(async () => {
    return {
      play: mocks.play,
      pause: mocks.pause,
      get paused() {
        return mocks.paused
      },
    } as unknown as HTMLAudioElement
  }),
}))

vi.mock('../config.json', () => ({
  default: {
    audio: {
      backgroundMusic: './mumu-adventures.mp3',
    },
  },
}))

vi.mock('./audio', () => ({
  loadAudio: mocks.loadAudio,
}))

describe('music utility functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mocks.paused = true
  })

  const importMusic = async () => await import('./music')

  it('starts background audio once and marks it started', async () => {
    const music = await importMusic()

    expect(music.hasBackgroundAudioStarted()).toBe(false)
    await music.startBackgroundAudio()

    expect(music.hasBackgroundAudioStarted()).toBe(true)
    expect(mocks.loadAudio).toHaveBeenCalledTimes(1)
    expect(mocks.loadAudio).toHaveBeenCalledWith('./mumu-adventures.mp3')
    expect(mocks.play).toHaveBeenCalledTimes(1)
  })

  it('does not reload or replay when already started', async () => {
    const music = await importMusic()

    await music.startBackgroundAudio()
    await music.startBackgroundAudio()

    expect(mocks.loadAudio).toHaveBeenCalledTimes(1)
    expect(mocks.play).toHaveBeenCalledTimes(1)
  })

  it('stopCurrentAudio pauses current background audio', async () => {
    const music = await importMusic()
    await music.startBackgroundAudio()

    music.stopCurrentAudio()

    expect(mocks.pause).toHaveBeenCalledTimes(1)
    expect(music.isAudioPlaying()).toBe(false)
  })

  it('toggleAudio plays when paused', async () => {
    const music = await importMusic()
    await music.startBackgroundAudio()
    music.stopCurrentAudio()

    expect(music.isAudioPlaying()).toBe(false)
    music.toggleAudio()
    await Promise.resolve()

    expect(mocks.play).toHaveBeenCalledTimes(2)
    expect(music.isAudioPlaying()).toBe(true)
  })

  it('toggleAudio pauses when currently playing', async () => {
    const music = await importMusic()
    await music.startBackgroundAudio()

    expect(music.isAudioPlaying()).toBe(true)
    music.toggleAudio()

    expect(mocks.pause).toHaveBeenCalledTimes(1)
    expect(music.isAudioPlaying()).toBe(false)
  })

  it('toggleAudio and stopCurrentAudio are safe before audio init', async () => {
    const music = await importMusic()

    expect(() => music.toggleAudio()).not.toThrow()
    expect(() => music.stopCurrentAudio()).not.toThrow()
    expect(music.hasBackgroundAudioStarted()).toBe(false)
    expect(music.isAudioPlaying()).toBe(false)
    expect(mocks.play).not.toHaveBeenCalled()
    expect(mocks.pause).not.toHaveBeenCalled()
  })
})
