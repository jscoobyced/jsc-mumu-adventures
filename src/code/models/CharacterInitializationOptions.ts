import { Sprites } from './Sprites'
import { Vector } from './Vector'

export interface CharacterInitializationOptions {
  x: number
  y: number
  size: number
  imageSrc: string
  velocity?: Vector
  sprites?: Sprites
  health?: number
}
