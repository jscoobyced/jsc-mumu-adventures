import { checkAudioSpriteTouched } from '../classes/AudioSprite'
import { Banner } from '../classes/Banner'
import config from '../config.json'
import { Keys } from '../models/Keys'
import { getDevicePixelRatio, isMobile, isTouchSupported } from './device'
import { getDrawContext } from './drawContext'
import { getSegmentNumber } from './getTouchedCoordinates'
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
        toggleAudio()
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

  const canvas = getDrawContext(isMobile)?.canvas
  if (canvas) {
    canvas.addEventListener('click', (event: MouseEvent): void => {
      const x = event.offsetX
      const y = event.offsetY
      const audioClicked = checkAudioSpriteTouched(x, y)
      if (audioClicked) {
        toggleAudio()
      }
    })
    canvas.addEventListener('touchend', (event: TouchEvent): void => {
      const x = event.changedTouches[0].clientX
      const y = event.changedTouches[0].clientY
      const audioTouched = checkAudioSpriteTouched(x, y)
      if (audioTouched) {
        toggleAudio()
      }
    })
  }

  window.addEventListener('touchstart', (event: TouchEvent): void => {
    event.preventDefault()
    const x = event.changedTouches[0].clientX
    const y = event.changedTouches[0].clientY
    const quadrant = getSegmentNumber(x, y, config.gamepadSize)

    switch (quadrant) {
      case 7:
        keys.w.pressed = true
        keys.a.pressed = true
        break
      case 8:
        keys.w.pressed = true
        break
      case 9:
        keys.w.pressed = true
        keys.d.pressed = true
        break
      case 4:
        keys.a.pressed = true
        break
      case 5:
        keys.g.pressed = true
        break
      case 6:
        keys.d.pressed = true
        break
      case 1:
        keys.s.pressed = true
        keys.a.pressed = true
        break
      case 2:
        keys.s.pressed = true
        break
      case 3:
        keys.s.pressed = true
        keys.d.pressed = true
        break
      default:
        break
    }
  })

  // Clear keys pressed when user stop touching the screen
  window.addEventListener('touchend', (event: TouchEvent): void => {
    event.preventDefault()
    keys.w.pressed = false
    keys.a.pressed = false
    keys.s.pressed = false
    keys.d.pressed = false
    keys.g.pressed = false
    keys.q.pressed = false
  })

  if (isTouchSupported) {
    const context = getDrawContext(isMobile)
    if (context) {
      context.canvas.setAttribute('style', 'width: 100%; height: 100%;')
      context.canvas.width = window.innerWidth * getDevicePixelRatio()
      context.canvas.height = window.innerHeight * getDevicePixelRatio()
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
    context.canvas.width = window.innerWidth * getDevicePixelRatio()
    context.canvas.height = window.innerHeight * getDevicePixelRatio()
    context.canvas.setAttribute('style', 'width: 100%; height: 100%;')
  }
}

export const handleBannerTouch = (banner: Banner) => {
  const canvas = getDrawContext(isMobile)?.canvas
  if (canvas) {
    const handleClick = (event: MouseEvent): void => {
      const x = event.offsetX
      const y = event.offsetY
      if (banner.checkBannerTouched(x, y)) {
        const keys = getKeys()
        keys.space.pressed = true
      }
    }
    const handleTouch = (event: TouchEvent): void => {
      const x = event.changedTouches[0].clientX
      const y = event.changedTouches[0].clientY
      if (banner.checkBannerTouched(x, y)) {
        const keys = getKeys()
        keys.space.pressed = true
      }
    }
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('touchend', handleTouch)
  }
}
