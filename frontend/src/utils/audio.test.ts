import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadAudio } from './audio'

const originalAudio = global.Audio

type MockAudioElement = {
  src: string
  loop: boolean
  volume: number
  oncanplaythrough: (() => void) | null
  onerror: ((e: unknown) => void) | null
}

const AudioMock = vi.fn(
  class {
    src = ''
    loop = false
    volume = 1
    oncanplaythrough: (() => void) | null = null
    onerror: ((e: unknown) => void) | null = null
  },
)

describe('Audio utilities', () => {
  beforeEach(() => {
    AudioMock.mockClear()
    global.Audio = AudioMock as unknown as typeof Audio
  })

  afterAll(() => {
    global.Audio = originalAudio
  })

  it('loads audio and configures properties before resolving', async () => {
    const audioUrl = 'path/to/audio/file.mp3'
    const audioPromise = loadAudio(audioUrl)
    const audioElement = AudioMock.mock.results[0]
      ?.value as MockAudioElement | undefined

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(audioElement).toBeDefined()
    expect(audioElement?.src).toBe(audioUrl)
    expect(audioElement?.loop).toBe(true)
    expect(audioElement?.volume).toBe(0.5)

    audioElement?.oncanplaythrough?.()
    await expect(audioPromise).resolves.toBe(audioElement)
  })

  it('rejects with a helpful error when audio loading fails', async () => {
    const audioUrl = 'path/to/broken.mp3'
    const audioPromise = loadAudio(audioUrl)
    const audioElement = AudioMock.mock.results[0]
      ?.value as MockAudioElement | undefined

    audioElement?.onerror?.('network-error')

    await expect(audioPromise).rejects.toThrow(
      `Failed to load audio from ${audioUrl}: network-error`,
    )
  })
})
