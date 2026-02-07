import { dpr } from '../utils/drawContext'
import { getKeys } from '../utils/eventListeners'
import { startBackgroundAudio } from '../utils/music'

const handleResize = (context: CanvasRenderingContext2D | null) => {
  if (context) {
    context.canvas.width = window.innerWidth * dpr
    context.canvas.height = window.innerHeight * dpr
    context.canvas.setAttribute('style', 'width: 100%; height: 100%;')
  }
}

const handleTap = async () => {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  if (canvas.requestFullscreen) {
    await canvas.requestFullscreen()
  }
  await startBackgroundAudio()
  window.removeEventListener('touchend', handleTap)
  const keys = getKeys()
  keys.space.pressed = true
}

export const setupMobileEventHandlers = (context: CanvasRenderingContext2D) => {
  // Check if the touch event is supported
  const isTouchSupported =
    'ontouchstart' in window || navigator.maxTouchPoints > 0

  if (isTouchSupported) {
    context.canvas.setAttribute('style', 'width: 100%; height: 100%;')
    context.canvas.width = window.innerWidth * dpr
    context.canvas.height = window.innerHeight * dpr
    // Mobile resize support
    window.addEventListener('resize', () => handleResize(context))
    // Mobile tap support
    window.addEventListener('touchend', handleTap)
  }
}
