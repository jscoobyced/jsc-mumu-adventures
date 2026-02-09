import { Vector } from '../models/Vector'

// Check if the touch event is supported
export const isTouchSupported =
  'ontouchstart' in window || navigator.maxTouchPoints > 0

export const isMobile = isTouchSupported && window.innerWidth <= 840

export const getScreenSize = (): Vector => {
  return {
    x: window.innerWidth,
    y: window.innerHeight,
  }
}

export const getDevicePixelRatio = (): number => {
  return window.devicePixelRatio || 1
}
