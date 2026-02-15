import { Vector } from '../models'

export class GamePad {
  public x: number
  public y: number
  public width: number
  public height: number
  public lineColor: string
  public lineWidth: number

  constructor({ x, y }: Vector, width: number, height: number, lineColor = 'black', lineWidth = 2) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.lineColor = lineColor
    this.lineWidth = lineWidth
  }

  public draw(c: CanvasRenderingContext2D): void {
    c.save()
    c.strokeStyle = this.lineColor
    c.lineWidth = this.lineWidth

    const cellW = this.width / 3
    const cellH = this.height / 3

    // Draw outer border
    c.beginPath()
    c.rect(this.x, this.y, this.width, this.height)
    c.stroke()

    // Draw grid lines (2 vertical + 2 horizontal)
    c.beginPath()
    // vertical lines
    c.moveTo(this.x + cellW, this.y)
    c.lineTo(this.x + cellW, this.y + this.height)
    c.moveTo(this.x + 2 * cellW, this.y)
    c.lineTo(this.x + 2 * cellW, this.y + this.height)
    // horizontal lines
    c.moveTo(this.x, this.y + cellH)
    c.lineTo(this.x + this.width, this.y + cellH)
    c.moveTo(this.x, this.y + 2 * cellH)
    c.lineTo(this.x + this.width, this.y + 2 * cellH)

    c.stroke()
    c.restore()
  }
}

export default GamePad
