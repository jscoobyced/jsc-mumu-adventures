import { describe, it, expect } from 'vitest'
import { getCanvasQuadrant } from './quadrant'

describe('getCanvasQuadrant', () => {
  it('returns correct quadrants for centers', () => {
    const size = { x: 300, y: 300 }

    const cases = [
      { point: { x: 50, y: 50 }, expected: 1 },
      { point: { x: 150, y: 50 }, expected: 2 },
      { point: { x: 250, y: 50 }, expected: 3 },
      { point: { x: 50, y: 150 }, expected: 4 },
      { point: { x: 150, y: 150 }, expected: 5 },
      { point: { x: 250, y: 150 }, expected: 6 },
      { point: { x: 50, y: 250 }, expected: 7 },
      { point: { x: 150, y: 250 }, expected: 8 },
      { point: { x: 250, y: 250 }, expected: 9 },
    ]

    for (const { point, expected } of cases) {
      expect(getCanvasQuadrant(size, point)).toBe(expected)
    }
  })

  it('clamps out of bounds to edges', () => {
    const size = { x: 300, y: 300 }

    expect(getCanvasQuadrant(size, { x: -10, y: -10 })).toBe(1)
    expect(getCanvasQuadrant(size, { x: 310, y: 310 })).toBe(9)
    expect(getCanvasQuadrant(size, { x: 0, y: 0 })).toBe(1)
    expect(getCanvasQuadrant(size, { x: 300, y: 300 })).toBe(9)
  })

  it('handles zero-sized canvas by returning center 5', () => {
    const size = { x: 0, y: 0 }
    expect(getCanvasQuadrant(size, { x: 10, y: 10 })).toBe(5)
  })

  it('assigns boundaries as expected (e.g., x=100 -> second column)', () => {
    const size = { x: 300, y: 300 }

    expect(getCanvasQuadrant(size, { x: 100, y: 0 })).toBe(2)
    expect(getCanvasQuadrant(size, { x: 200, y: 0 })).toBe(3)
    expect(getCanvasQuadrant(size, { x: 0, y: 100 })).toBe(4)
    expect(getCanvasQuadrant(size, { x: 0, y: 200 })).toBe(7)
  })
})
