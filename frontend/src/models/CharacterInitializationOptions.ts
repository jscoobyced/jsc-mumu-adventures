import { Sprites } from './Sprites'
import { Vector } from './Vector'

export interface CharacterInitializationOptions {
  position: Vector
  size: number
  imageSrc: string
  velocity: Vector
  sprites: Sprites
  health: number
  name?: string
}

export interface NpcInitializationOptions {
  characterInitializationOptions: CharacterInitializationOptions
  attacking?: boolean
}

export interface TalkingNpcInitializationOptions {
  npcInitializationOptions: NpcInitializationOptions
  messages: string[]
  expectedObject?: string
  postObjectMessages: string[]
  waitingMessages: string[]
  finalMessages: string[]
  portraitImageSrc?: string
}
