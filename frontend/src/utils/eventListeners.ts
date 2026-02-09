import { Keys } from '../models/Keys'
import { isTouchSupported } from './device'
import { dpr, getDrawContext } from './drawContext'
import { startBackgroundAudio, toggleAudio } from './music'

// Declare global variables (these should be defined elsewhere in your project)
let keys!: Keys

export const getKeys = (): Keys => keys
export let lastTime: number = performance.now()
export const getLastTime = (): number => lastTime
export const setLastTime = (time: number): void => {
  lastTime = time
}

const initializeKeys = (): void => {
  keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
    g: { pressed: false },
    q: { pressed: false },
    space: { pressed: false },
    spaceEnabled: true,
  }
}

initializeKeys()

export const initializeEventListeners = (): void => {
  window.addEventListener('keydown', (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        keys.w.pressed = true
        break
      case 'a':
      case 'ArrowLeft':
        keys.a.pressed = true
        break
      case 's':
      case 'ArrowDown':
        keys.s.pressed = true
        break
      case 'd':
      case 'ArrowRight':
        keys.d.pressed = true
        break
      case ' ':
        if (keys.spaceEnabled) {
          keys.space.pressed = true
        }
        break
      case 'g':
        keys.g.pressed = true
        break
      case 'q':
        keys.q.pressed = true
        toggleAudio(keys)
        break
      default:
        break
    }
    startBackgroundAudio().catch((error) => {
      console.error('Error starting background audio:', error)
    })
  })

  window.addEventListener('keyup', (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        keys.w.pressed = false
        break
      case 'a':
      case 'ArrowLeft':
        keys.a.pressed = false
        break
      case 's':
      case 'ArrowDown':
        keys.s.pressed = false
        break
      case 'd':
      case 'ArrowRight':
        keys.d.pressed = false
        break
      case 'g':
        keys.g.pressed = false
        break
      case 'q':
        keys.q.pressed = false
        break
      default:
        break
    }
  })

  window.addEventListener(
    'touchend',
    (event: TouchEvent): void => {
      event.preventDefault()
      keys.w.pressed = false
      keys.a.pressed = false
      keys.s.pressed = false
      keys.d.pressed = false
      keys.g.pressed = false
    },
    { passive: false },
  )

  if (isTouchSupported) {
    const context = getDrawContext()
    if (context) {
      context.canvas.setAttribute('style', 'width: 100%; height: 100%;')
      context.canvas.width = window.innerWidth * dpr
      context.canvas.height = window.innerHeight * dpr
      // Mobile resize support
      window.addEventListener('resize', () => handleResize(context))
    }
    // Mobile tap support
    window.addEventListener('touchend', handleTap)
  }

  // On return to game's tab, ensure delta time is reset
  document.addEventListener('visibilitychange', (): void => {
    if (!document.hidden) {
      lastTime = performance.now()
    }
  })
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

const handleResize = (context: CanvasRenderingContext2D | null) => {
  if (context) {
    context.canvas.width = window.innerWidth * dpr
    context.canvas.height = window.innerHeight * dpr
    context.canvas.setAttribute('style', 'width: 100%; height: 100%;')
  }
}
