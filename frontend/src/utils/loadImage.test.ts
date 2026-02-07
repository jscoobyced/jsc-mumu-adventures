import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadImage } from './loadImage'

describe('loadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load an image successfully', async () => {
    const src = './test-image.png'

    const result = await loadImage(src)

    expect(result).toBeInstanceOf(Image)
    expect(result.src).toContain('test-image.png')
  })

  it('should cache loaded images', async () => {
    const src = './cached-image.png'

    const firstLoad = await loadImage(src)
    const secondLoad = await loadImage(src)

    expect(firstLoad).toBe(secondLoad)
  })

  it('should return cached image immediately', async () => {
    const src = './immediate-cache.png'

    await loadImage(src)
    const cachedResult = await loadImage(src)

    expect(cachedResult).toBeInstanceOf(Image)
  })

  it('should handle multiple different images', async () => {
    const src1 = './image1.png'
    const src2 = './image2.png'

    const image1 = await loadImage(src1)
    const image2 = await loadImage(src2)

    expect(image1).not.toBe(image2)
    expect(image1.src).toContain('image1.png')
    expect(image2.src).toContain('image2.png')
  })

  it('should reject on image load error', async () => {
    const src = './error-image.png'

    // Override Image mock for this test to simulate error
    const originalImage = global.Image
    global.Image = class {
      onload: (() => void) | null = null
      onerror: ((e: unknown) => void) | null = null
      src = ''

      constructor() {
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error('Load failed'))
        }, 0)
      }
    } as typeof Image

    await expect(loadImage(src)).rejects.toBeDefined()

    // Restore original mock
    global.Image = originalImage
  })

  it('should set correct src on Image element', async () => {
    const src = './set-src-test.png'

    const result = await loadImage(src)

    expect(result.src).toContain('set-src-test.png')
  })

  it('should handle relative paths', async () => {
    const src = '../images/relative-path.png'

    const result = await loadImage(src)

    expect(result.src).toContain('relative-path.png')
  })

  it('should handle absolute paths', async () => {
    const src = '/images/absolute-path.png'

    const result = await loadImage(src)

    expect(result.src).toContain('absolute-path.png')
  })

  it('should maintain separate caches for different paths', async () => {
    const src1 = './image-a.png'
    const src2 = './image-b.png'
    const src3 = './image-a.png'

    const imageA1 = await loadImage(src1)
    const imageB = await loadImage(src2)
    const imageA2 = await loadImage(src3)

    expect(imageA1).toBe(imageA2)
    expect(imageA1).not.toBe(imageB)
  })

  it('should resolve Promise with HTMLImageElement', async () => {
    const src = './promise-test.png'

    const result = await loadImage(src)

    expect(result).toBeInstanceOf(Image)
  })
})
