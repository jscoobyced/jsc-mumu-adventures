import { describe, expect, it, vi } from 'vitest'
import { CollisionBlock } from './CollisionBlock'

describe('CollisionBlock', () => {
  it('should create a collision block with correct dimensions including buffer', () => {
    const block = new CollisionBlock({ x: 100, y: 200, size: 16 })

    // Buffer is 3, so actual position is 103, 203
    expect(block.x).toBe(103)
    expect(block.y).toBe(203)
    // Width and height are reduced by 2 * buffer (6 total)
    expect(block.width).toBe(10)
    expect(block.height).toBe(10)
  })

  it('should create a collision block at origin', () => {
    const block = new CollisionBlock({ x: 0, y: 0, size: 16 })

    expect(block.x).toBe(3)
    expect(block.y).toBe(3)
    expect(block.width).toBe(10)
    expect(block.height).toBe(10)
  })

  it('should handle larger tile sizes', () => {
    const block = new CollisionBlock({ x: 50, y: 75, size: 32 })

    expect(block.x).toBe(53)
    expect(block.y).toBe(78)
    expect(block.width).toBe(26)
    expect(block.height).toBe(26)
  })

  it('should draw the collision block with correct styling', () => {
    const block = new CollisionBlock({ x: 100, y: 200, size: 16 })
    const mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    block.draw(mockContext)

    expect(mockContext.fillStyle).toBe('rgba(255, 0, 0, 0.5)')
    // fillRect is called with original position minus buffer, and size plus 2*buffer
    expect(mockContext.fillRect).toHaveBeenCalledWith(100, 200, 16, 16)
  })

  it('should draw multiple blocks independently', () => {
    const block1 = new CollisionBlock({ x: 0, y: 0, size: 16 })
    const block2 = new CollisionBlock({ x: 16, y: 16, size: 16 })
    const mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    block1.draw(mockContext)
    block2.draw(mockContext)

    expect(mockContext.fillRect).toHaveBeenCalledTimes(2)
    expect(mockContext.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 16, 16)
    expect(mockContext.fillRect).toHaveBeenNthCalledWith(2, 16, 16, 16, 16)
  })
})
