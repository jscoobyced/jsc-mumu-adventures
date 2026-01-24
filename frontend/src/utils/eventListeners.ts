import { Keys } from '../models/Keys'

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
        break
      default:
        break
    }
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

  // On return to game's tab, ensure delta time is reset
  document.addEventListener('visibilitychange', (): void => {
    if (!document.hidden) {
      lastTime = performance.now()
    }
  })
}
