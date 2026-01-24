import { getDrawContext } from '../utils/drawContext'
import { getKeys } from '../utils/eventListeners'
import { startGame } from '../utils/game'
import { loadImage } from '../utils/loadImage'

export const intro = async () => {
  const context = getDrawContext()
  if (!context) {
    throw new Error('Failed to get 2D context from canvas')
  }
  const introImage = await loadImage('/images/intro.png')
  const titleImage = await loadImage('/images/title-text.png')
  animate(context, introImage, titleImage)
}

const animate = (
  context: CanvasRenderingContext2D,
  introImage: HTMLImageElement,
  titleImage: HTMLImageElement,
) => {
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
