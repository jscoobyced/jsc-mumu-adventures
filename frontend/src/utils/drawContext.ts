import config from '../config.json'
import { getDevicePixelRatio } from './device'

export const getDrawContext = (
  isMobile: boolean,
): CanvasRenderingContext2D | null => {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d')
  canvas.width = isMobile
    ? window.innerWidth * getDevicePixelRatio()
    : config.canvasWidth
  canvas.height = isMobile
    ? window.innerHeight * getDevicePixelRatio()
    : config.canvasHeight
  return context
}
