export const SPACING = 20

export class GamePad {
  public width: number
  public lineColor: string
  public lineWidth: number

  constructor(width: number, lineColor = 'white', lineWidth = 5) {
    this.width = width
    this.lineColor = lineColor
    this.lineWidth = lineWidth
  }

  public draw(c: CanvasRenderingContext2D): void {
    c.save()
    const x = this.width / 2 + SPACING
    const y = c.canvas.height - this.width / 2 - SPACING
    c.strokeStyle = this.lineColor
    c.lineWidth = this.lineWidth
    // Make opacity 50%
    c.globalAlpha = 0.5

    // Draw a circle at the center with diameter = width
    const centerX = x
    const centerY = y
    const radius = this.width / 2

    c.beginPath()
    c.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    c.stroke()

    c.restore()
  }
}

export default GamePad
