import { SPACING } from '../classes/GamePad'
import { getDevicePixelRatio, getScreenSize, isMobile } from './device'
import { getDrawContext } from './drawContext'

export const getRatio = () => {
  const screenSize = getScreenSize()
  const canvas = getDrawContext(isMobile)?.canvas
  const xRatio = canvas ? canvas.width / screenSize.x : 1
  const yRatio = canvas ? canvas.height / screenSize.y : 1
  return { xRatio, yRatio, screenSize }
}

export const checkSpriteTouched = (
  x: number,
  y: number,
  spriteWidth: number,
  spriteHeight: number,
  spriteLeftTopx: number,
  spriteLeftTopy: number,
): boolean => {
  const spriteRightBottomx = Math.floor(spriteLeftTopx + spriteWidth)
  const spriteRightBottomy = Math.floor(spriteLeftTopy + spriteHeight)
  const dpr = getDevicePixelRatio()
  const adjustedX = x * dpr
  const adjustedY = y * dpr

  return (
    adjustedX >= spriteLeftTopx &&
    adjustedX <= spriteRightBottomx &&
    adjustedY >= spriteLeftTopy &&
    adjustedY <= spriteRightBottomy
  )
}

export const getSegmentNumber = (
  x: number,
  y: number,
  width: number,
): number => {
  const ratio = getRatio()
  const adjustedX = x * ratio.xRatio
  const adjustedY = y * ratio.yRatio
  const centerX = width / 2 + SPACING
  const centerY = ratio.screenSize.y * ratio.yRatio - width / 2 - SPACING
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
