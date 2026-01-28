import config from '../config.json'
import { Keys } from '../models/Keys'

let backgroundAudio: HTMLAudioElement | null = null
let backgroundAudioStarted: boolean = false

export const stopCurrentAudio = (): void => {
  if (backgroundAudio) {
    backgroundAudio.pause()
  }
}

export const hasBackgroundAudioStarted = (): boolean => {
  return backgroundAudioStarted
}

export const startBackgroundAudio = async (): Promise<void> => {
  if (backgroundAudioStarted) {
    return
  }
  if (!backgroundAudio) {
    backgroundAudio = await loadAudio(config.audio.backgroundMusic)
  }
  await backgroundAudio.play()
  backgroundAudioStarted = true
}

export const loadAudio = async (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.src = url
    audio.loop = true
    audio.volume = 0.5
    audio.oncanplaythrough = () => {
      resolve(audio)
    }
    audio.onerror = (e) =>
      reject(new Error(`Failed to load audio from ${url}: ${e}`))
  })
}

export const toggleAudio = (keys: Keys): void => {
  if (keys.q.pressed) {
    if (backgroundAudio && backgroundAudio.paused) {
      ;(async () => {
        backgroundAudio.play()
      })()
    } else {
      stopCurrentAudio()
    }
    keys.q.pressed = false
  }
}
