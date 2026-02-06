import { beforeEach, vi } from 'vitest'

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  src = ''
  width = 64
  height = 64

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
} as unknown as typeof Image

// Mock HTMLImageElement
global.HTMLImageElement = Image as unknown as typeof HTMLImageElement

// Mock canvas context
export const createMockContext = () => {
  return {
    canvas: {
      width: 1024,
      height: 576,
    },
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    set fillStyle(value: string) {
      // Setter for fillStyle
      void value
    },
    set font(value: string) {
      // Setter for font
      void value
    },
    set textAlign(value: string) {
      // Setter for textAlign
      void value
    },
    set globalAlpha(value: number) {
      // Setter for globalAlpha
      void value
    },
  } as unknown as CanvasRenderingContext2D
}

// Mock performance.now()
if (typeof performance === 'undefined') {
  global.performance = {
    now: vi.fn(() => Date.now()),
  } as unknown as Performance
}

// Mock document.fonts if needed
if (typeof document !== 'undefined' && !document.fonts) {
  Object.defineProperty(document, 'fonts', {
    value: {
      add: vi.fn(),
    },
  })
}

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
