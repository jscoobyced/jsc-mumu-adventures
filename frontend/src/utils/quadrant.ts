import type { Vector } from '../models/Vector'

/**
 * Returns a quadrant number (1-9) for a point on a canvas split into a 3x3 grid.
 * Quadrant numbering (row-major):
 * 1 2 3
 * 4 5 6
 * 7 8 9
 *
 * Top-left is 1, center is 5, bottom-right is 9.
 * Coordinates outside the canvas are clamped to the nearest edge.
 */
export const getCanvasQuadrant = (
  canvas: HTMLCanvasElement,
  point: Vector,
): number => {
  const width = canvas.width || 0
  const height = canvas.height || 0

  if (width <= 0 || height <= 0) {
    // If canvas has no size, default to center
    return 5
  }

  const x = Math.max(0, Math.min(point.x, width))
  const y = Math.max(0, Math.min(point.y, height))

  const col = Math.min(2, Math.floor((x / width) * 3))
  const row = Math.min(2, Math.floor((y / height) * 3))

  return row * 3 + col + 1
}
