import config from '../config.json'
import { SpriteConfig, Vector } from '../models'
import { isMobile } from '../utils/device'
import { getDrawContext } from '../utils/drawContext'
import { checkSpriteTouched, getRatio } from '../utils/getTouchedCoordinates'
import { isAudioPlaying } from '../utils/music'
import { SPACING } from './GamePad'

export class AudioSprite {
  public x: number
  public y: number
  public width: number
  public height: number
  public center: Vector
  public loaded: boolean
  public image: HTMLImageElement
  public currentFrame: number
  public currentSprite: SpriteConfig

  constructor({ x, y }: Vector, size: number, currentFrame = 0) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }

    this.loaded = false
    this.image = new Image()
    this.image.onload = (): void => {
      this.loaded = true
    }
    this.image.src = config.images.decorations.audio
    this.currentFrame = currentFrame

    this.currentSprite = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      frameCount: 2,
    }
  }

  public draw(c: CanvasRenderingContext2D): void {
    if (!this.loaded) return
    this.currentFrame = isAudioPlaying() ? 0 : 1

    c.drawImage(
      this.image,
      this.currentSprite.x + this.currentSprite.width * this.currentFrame,
      this.currentSprite.y,
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height,
    )
  }

  public setMuted(muted: boolean): void {
    this.currentFrame = muted ? 0 : 1
  }
}

export const checkAudioSpriteTouched = (x: number, y: number): boolean => {
  const canvas = getDrawContext(isMobile)?.canvas
  if (!canvas) return false
  const ratio = getRatio()
  const xRatio = isMobile ? ratio.xRatio : 1 / ratio.xRatio
  const yRatio = isMobile ? ratio.yRatio : 1 / ratio.yRatio
  const audioSize = 32 * xRatio
  const audioSpriteLeftTopx = Math.floor(
    canvas.width - audioSize - SPACING * xRatio,
  )
  const audioSpriteLeftTopy = Math.floor(SPACING * yRatio)
  return checkSpriteTouched(
    x,
    y,
    audioSize,
    audioSize,
    audioSpriteLeftTopx,
    audioSpriteLeftTopy,
  )
}
