import config from '../config.json'
import { Keys, Vector } from '../models'
import { checkSpriteTouched } from '../utils/getTouchedCoordinates'

export class Banner {
  public x: number
  public y: number
  public width = 0
  public height = 0
  public loaded: boolean
  public image: HTMLImageElement
  private texts: string[] = []
  private currentIndex: number = 0
  private portraitImage?: HTMLImageElement
  private textIndent = 0
  private fontSize = 24
  private lineHeight = 30
  private isMobile: boolean = false

  constructor({ x, y }: Vector, isMobile: boolean = false) {
    this.x = x
    this.y = y
    this.isMobile = isMobile
    this.updateSize(config.canvasWidth - 2)
    this.loaded = false
    this.image = new Image()
    this.image.onload = (): void => {
      this.loaded = true
    }
    this.image.src = config.images.ui.banner.path
    if (isMobile) {
      this.fontSize = 46
      this.lineHeight = 50
    }
  }

  public show(texts: string[], portrait?: HTMLImageElement): void {
    this.texts = texts
    this.currentIndex = 0
    this.portraitImage = portrait
  }

  public close(): void {
    this.texts = []
    this.currentIndex = 0
  }

  public checkBannerTouched = (x: number, y: number): boolean => {
    return checkSpriteTouched(x, y, this.width, this.height, 10, 10)
  }

  public draw(c: CanvasRenderingContext2D, keys: Keys): boolean {
    if (!this.loaded || this.texts.length === 0) return false
    if (keys.space.pressed) {
      keys.space.pressed = false
      this.currentIndex++
      if (this.currentIndex >= this.texts.length) {
        this.currentIndex = 0
        keys.spaceEnabled = false
        this.close()
        return true
      }
    }
    this.textIndent = this.portraitImage ? this.portraitImage.width + 20 : 0

    if (this.currentIndex < this.texts.length) {
      this.updateSize(c.canvas.width - 2)
      c.drawImage(this.image, this.x, this.y, this.width, this.height)
      c.save()
      c.font = `${this.fontSize}px MumuFont`
      c.textAlign = 'center'
      c.fillStyle = 'brown'
      this.wrapText(
        c,
        this.texts[this.currentIndex],
        this.x + (this.width - this.textIndent) / 2 + this.textIndent,
        this.y + this.height / 2 - 20,
        this.width - this.textIndent - 40,
        this.lineHeight,
      )
      c.restore()
    }
    if (this.portraitImage) {
      const portraitHeight =
        this.portraitImage.height * (this.isMobile ? 1.5 : 1)
      const portraitWidth = this.portraitImage.width * (this.isMobile ? 1.5 : 1)
      c.drawImage(
        this.portraitImage,
        this.x + 20,
        this.y + 20,
        portraitWidth,
        portraitHeight,
      )
    }

    return false
  }

  private wrapText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ): void => {
    const words = text.split(' ')
    let line = ''
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y)
        line = words[n] + ' '
        y += lineHeight
      } else {
        line = testLine
      }
    }
    context.fillText(line, x, y)
  }

  private updateSize = (initialWidth: number): void => {
    const ratio = (initialWidth + this.x) / config.images.ui.banner.width
    this.width = config.images.ui.banner.width * ratio
    this.height = config.images.ui.banner.height * ratio
  }
}
