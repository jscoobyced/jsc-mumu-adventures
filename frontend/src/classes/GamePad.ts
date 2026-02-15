import { getScreenSize, isMobile } from '../utils/device'
import { getDrawContext } from '../utils/drawContext'

const SPACING = 50

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

export const getSegmentNumber = (
  x: number,
  y: number,
  width: number,
): number => {
  const screenSize = getScreenSize()
  const canvas = getDrawContext(isMobile)?.canvas
  const xRatio = canvas ? canvas.width / screenSize.x : 1
  const yRatio = canvas ? canvas.height / screenSize.y : 1
  const adjustedX = x * xRatio
  const adjustedY = y * yRatio
  const centerX = width / 2 + SPACING
  const centerY = screenSize.y * yRatio - width / 2 - SPACING
  const dx = adjustedX - centerX
  const dy = adjustedY - centerY
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance > width / 2) {
    return 0 // Outside the circle
  }

  const angle = Math.atan2(dy, dx) // Get the angle in radians
  const degree = (angle * 180) / Math.PI // Convert to degrees

  if (degree >= -22.5 && degree < 22.5) {
    return 6 // Right
  } else if (degree >= 22.5 && degree < 67.5) {
    return 3 // Down-Right
  } else if (degree >= 67.5 && degree < 112.5) {
    return 2 // Down
  } else if (degree >= 112.5 && degree < 157.5) {
    return 1 // Down-Left
  } else if (degree >= 157.5 || degree < -157.5) {
    return 4 // Left
  } else if (degree >= -157.5 && degree < -112.5) {
    return 7 // Up-Left
  } else if (degree >= -112.5 && degree < -67.5) {
    return 8 // Up
  } else if (degree >= -67.5 && degree < -22.5) {
    return 9 // Up-Right
  }

  return 0
}
export default GamePad
