export interface NpcConfiguration {
  type: string
  position: { x: number; y: number }
  size: number
  imageSrc: string
  health: number
  name: string
  messages: string[]
  expectedObject: string
  postObjectMessages: string[]
  waitingMessages: string[]
  finalMessages: string[]
  portraitImageSrc: string
}

export type NpcData = NpcConfiguration
