import config from '../config.json'
import { Keys, Vector } from '../models'

export class Banner {
  public x: number
  public y: number
  public width: number
  public height: number
  public loaded: boolean
  public image: HTMLImageElement
  private texts: string[] = []
  private currentIndex: number = 0

  constructor({ x, y }: Vector) {
    const ratio = (config.canvasWidth - 2 * x) / config.images.ui.banner.width
    const width = config.images.ui.banner.width * ratio
    const height = config.images.ui.banner.height * ratio
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.loaded = false
    this.image = new Image()
    this.image.onload = (): void => {
      this.loaded = true
    }
    this.image.src = config.images.ui.banner.path
  }

  public show(texts: string[]): void {
    this.texts = texts
    this.currentIndex = 0
  }

  public close(): void {
    this.texts = []
    this.currentIndex = 0
  }

  public draw(c: CanvasRenderingContext2D, keys: Keys): boolean {
    if (!this.loaded || this.texts.length === 0) return false
    if (keys.space.pressed) {
      keys.space.pressed = false
      this.currentIndex++
      if (this.currentIndex >= this.texts.length) {
        keys.spaceEnabled = false
        this.close()
        return true
      }
    }

    if (this.currentIndex < this.texts.length) {
      c.drawImage(this.image, this.x, this.y, this.width, this.height)

      c.save()
      c.font = '24px MumuFont'
      c.textAlign = 'center'
      c.fillStyle = 'brown'
      this.wrapText(
        c,
        this.texts[this.currentIndex],
        this.x + this.width / 2,
        this.y + this.height / 2 - 20,
        this.width - 40,
        30,
      )
      c.restore()
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
}
