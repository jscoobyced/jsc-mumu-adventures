import { describe, expect, it } from 'vitest'
import { characterSprites } from './sprites'
import config from './config.json'

describe('sprites', () => {
  describe('characterSprites', () => {
    it('should have all four directional sprites', () => {
      expect(characterSprites.walkDown).toBeDefined()
      expect(characterSprites.walkUp).toBeDefined()
      expect(characterSprites.walkLeft).toBeDefined()
      expect(characterSprites.walkRight).toBeDefined()
    })

    it('should use tileSize from config for dimensions', () => {
      const tileSize = config.tileSize

      expect(characterSprites.walkDown.width).toBe(tileSize)
      expect(characterSprites.walkDown.height).toBe(tileSize)
      expect(characterSprites.walkUp.width).toBe(tileSize)
      expect(characterSprites.walkUp.height).toBe(tileSize)
      expect(characterSprites.walkLeft.width).toBe(tileSize)
      expect(characterSprites.walkLeft.height).toBe(tileSize)
      expect(characterSprites.walkRight.width).toBe(tileSize)
      expect(characterSprites.walkRight.height).toBe(tileSize)
    })

    it('should have 4 frames per animation', () => {
      expect(characterSprites.walkDown.frameCount).toBe(4)
      expect(characterSprites.walkUp.frameCount).toBe(4)
      expect(characterSprites.walkLeft.frameCount).toBe(4)
      expect(characterSprites.walkRight.frameCount).toBe(4)
    })

    it('should have x=0 for all sprites', () => {
      expect(characterSprites.walkDown.x).toBe(0)
      expect(characterSprites.walkUp.x).toBe(0)
      expect(characterSprites.walkLeft.x).toBe(0)
      expect(characterSprites.walkRight.x).toBe(0)
    })

    it('should have incrementing y positions by tileSize', () => {
      const tileSize = config.tileSize
      expect(characterSprites.walkDown.y).toBe(0)
      expect(characterSprites.walkUp.y).toBe(tileSize)
      expect(characterSprites.walkLeft.y).toBe(tileSize * 2)
      expect(characterSprites.walkRight.y).toBe(tileSize * 3)
    })
  })
})
