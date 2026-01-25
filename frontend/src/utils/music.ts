import config from '../config.json'
import { Keys } from '../models/Keys'

let currentAudio: HTMLAudioElement | null = null

export const stopCurrentAudio = (): void => {
  if (currentAudio) {
    currentAudio.pause()
  }
}

export const loadAndPlayAudio = async (
  url: string,
): Promise<HTMLAudioElement> => {
  if (currentAudio) {
    currentAudio.play()
    return Promise.resolve(currentAudio)
  } else {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.src = url
      audio.autoplay = true
      audio.loop = true
      audio.volume = 0.5
      audio.oncanplaythrough = () => {
        currentAudio = audio
        resolve(audio)
      }
      audio.onerror = (e) =>
        reject(new Error(`Failed to load audio from ${url}: ${e}`))
    })
  }
}

let playMusic = true

export const toggleAudio = (keys: Keys): void => {
  if (keys.q.pressed) {
    if (!playMusic) {
      playMusic = true
      loadAndPlayAudio(config.audio.backgroundMusic).catch((error) => {
        console.error('Error playing audio:', error)
      })
    } else {
      playMusic = false
      stopCurrentAudio()
    }
    keys.q.pressed = false
  }
}
