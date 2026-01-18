import config from '../config.json'

export const dpr: number = Math.max(1, window.devicePixelRatio)

export const getContext = (): CanvasRenderingContext2D | null => {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d')
  canvas.width = config.canvasWidth * dpr
  canvas.height = config.canvasHeight * dpr
  return context
}
