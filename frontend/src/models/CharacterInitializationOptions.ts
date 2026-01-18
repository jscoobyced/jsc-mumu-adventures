import { Sprites } from './Sprites'
import { Vector } from './Vector'

export interface CharacterInitializationOptions {
  position: Vector
  size: number
  imageSrc: string
  velocity?: Vector
  sprites?: Sprites
  health?: number
}

export interface NpcInitializationOptions extends CharacterInitializationOptions {
  attacking?: boolean
  messages?: string[]
  isKeyNpc?: boolean
  expectedObject?: string
  postObjectMessages?: string[]
}
