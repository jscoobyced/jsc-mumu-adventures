import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('device', () => {
  let originalOntouch: PropertyDescriptor | undefined
  let originalMaxTouch: PropertyDescriptor | undefined
  let originalInnerWidth: PropertyDescriptor | undefined

  beforeEach(() => {
    originalOntouch = Object.getOwnPropertyDescriptor(window, 'ontouchstart')
    originalMaxTouch = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints')
    originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth')
  })

  afterEach(() => {
    // Reset module registry so imports re-evaluate with current globals
    vi.resetModules()

    if (originalOntouch) {
      Object.defineProperty(window, 'ontouchstart', originalOntouch)
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).ontouchstart
      } catch {
        // ignore
      }
    }

    if (originalMaxTouch) {
      Object.defineProperty(navigator, 'maxTouchPoints', originalMaxTouch)
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (navigator as any).maxTouchPoints
      } catch {
        // ignore
      }
    }

    if (originalInnerWidth) {
      Object.defineProperty(window, 'innerWidth', originalInnerWidth)
    }
  })

  const importWithGlobals = async (opts: {
    ontouchValue?: unknown
    maxTouchValue?: number
    innerWidthValue?: number
  }) => {
    vi.resetModules()

    // If ontouchValue is provided, define it. Otherwise try to delete the property
    if (Object.prototype.hasOwnProperty.call(opts, 'ontouchValue')) {
      if (opts.ontouchValue === undefined) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (window as any).ontouchstart
        } catch {
          // ignore
        }
      } else {
        Object.defineProperty(window, 'ontouchstart', {
          configurable: true,
          value: opts.ontouchValue,
        })
      }
    }

    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: opts.maxTouchValue ?? 0,
    })

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: opts.innerWidthValue ?? 1024,
    })

    return await import('./device')
  }

  it('reports touch supported when ontouchstart exists', async () => {
    const device = await importWithGlobals({ ontouchValue: null, maxTouchValue: 0, innerWidthValue: 1024 })

    expect(device.isTouchSupported).toBe(true)
    expect(device.isMobile).toBe(false)
  })

  it('reports touch supported when navigator.maxTouchPoints > 0', async () => {
    const device = await importWithGlobals({ ontouchValue: undefined, maxTouchValue: 2, innerWidthValue: 1024 })

    expect(device.isTouchSupported).toBe(true)
    expect(device.isMobile).toBe(false)
  })

  it('reports not touch supported when neither indicator present', async () => {
    const device = await importWithGlobals({ ontouchValue: undefined, maxTouchValue: 0, innerWidthValue: 1024 })

    expect(device.isTouchSupported).toBe(false)
    expect(device.isMobile).toBe(false)
  })

  it('reports mobile when touch supported and innerWidth <= 840', async () => {
    const device = await importWithGlobals({ ontouchValue: null, maxTouchValue: 0, innerWidthValue: 800 })

    expect(device.isTouchSupported).toBe(true)
    expect(device.isMobile).toBe(true)
  })

  it('considers edge width 840 as mobile when touch supported', async () => {
    const device = await importWithGlobals({ ontouchValue: null, maxTouchValue: 0, innerWidthValue: 840 })

    expect(device.isTouchSupported).toBe(true)
    expect(device.isMobile).toBe(true)
  })
})