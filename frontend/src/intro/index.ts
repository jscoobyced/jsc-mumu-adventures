import config from '../config.json'
import { getDrawContext } from '../utils/drawContext'
import { getKeys } from '../utils/eventListeners'
import { startGame } from '../utils/game'
import { loadImage } from '../utils/loadImage'
import { jscLog } from '../utils/log'
import { setupMobileEventHandlers } from './mobile-setup'

export const intro = async () => {
  const context = getDrawContext()
  if (!context) {
    throw new Error('Failed to get 2D context from canvas')
  }
  const introImage = await loadImage(config.images.tilesets.intro)
  const titleImage = await loadImage(config.images.tilesets.title)
  setupMobileEventHandlers(context)
  animate(context, introImage, titleImage)
}

const animate = (
  context: CanvasRenderingContext2D,
  introImage: HTMLImageElement,
  titleImage: HTMLImageElement,
) => {
  jscLog('Intro animation frame')
  const keys = getKeys()
  if (keys.space.pressed) {
    keys.space.pressed = false
    keys.spaceEnabled = false
    startGame()
    return
  }
  context.drawImage(
    introImage,
    0,
    0,
    context.canvas.width,
    context.canvas.height,
  )
  const currentTime: number = performance.now()
  const titleY = 100 + 10 * Math.sin(currentTime / 300)
  context.drawImage(
    titleImage,
    context.canvas.width / 2 - titleImage.width / 2,
    titleY,
  )
  requestAnimationFrame(() => animate(context, introImage, titleImage))
}
