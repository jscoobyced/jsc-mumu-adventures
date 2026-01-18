export class CollisionBlock {
  x: number
  y: number
  width: number
  height: number

  // A small buffer to prevent sticking to collision blocks
  private static readonly BUFFER = 3

  constructor({ x, y, size }: { x: number; y: number; size: number }) {
    this.x = x + CollisionBlock.BUFFER
    this.y = y + CollisionBlock.BUFFER
    this.width = size - 2 * CollisionBlock.BUFFER
    this.height = size - 2 * CollisionBlock.BUFFER
  }

  draw(c: CanvasRenderingContext2D): void {
    // Optional: Draw collision blocks for debugging
    c.fillStyle = 'rgba(255, 0, 0, 0.5)'
    c.fillRect(
      this.x - CollisionBlock.BUFFER,
      this.y - CollisionBlock.BUFFER,
      this.width + 2 * CollisionBlock.BUFFER,
      this.height + 2 * CollisionBlock.BUFFER,
    )
  }
}
