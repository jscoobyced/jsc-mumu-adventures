import config from '../config.json'
import { loadAudio } from './audio'

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

export const toggleAudio = (): void => {
  if (backgroundAudio && backgroundAudio.paused) {
    ;(async () => {
      backgroundAudio.play()
    })()
  } else {
    stopCurrentAudio()
  }
}

export const isAudioPlaying = (): boolean => {
  return backgroundAudio ? !backgroundAudio.paused : false
}
