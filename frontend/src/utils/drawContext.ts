import config from '../config.json'
import { getDevicePixelRatio } from './device'

export const getDrawContext = (): CanvasRenderingContext2D | null => {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d')
  canvas.width = config.canvasWidth * getDevicePixelRatio()
  canvas.height = config.canvasHeight * getDevicePixelRatio()
  return context
}
