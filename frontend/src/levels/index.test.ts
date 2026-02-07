import { describe, expect, it } from 'vitest'
import { defaultLevel, levelConfig } from './index'
import { levelData as levelA1 } from './A/1/index'
import { levelData as levelA2 } from './A/2/index'
import { LevelDirection } from '../models/LevelData'

describe('levels/index', () => {
  describe('levelConfig', () => {
    it('should export level configuration array', () => {
      expect(levelConfig).toBeDefined()
      expect(Array.isArray(levelConfig)).toBe(true)
      expect(levelConfig.length).toBeGreaterThan(0)
    })

    it('should have correct structure for each config', () => {
      levelConfig.forEach((config) => {
        expect(config).toHaveProperty('level')
        expect(config.level).toHaveProperty('name')
        expect(config.level).toHaveProperty('layersData')
        expect(config.level).toHaveProperty('frontRenderedLayersData')
        expect(config.level).toHaveProperty('tilesets')
        expect(config.level).toHaveProperty('l_Collisions')
        expect(config.level).toHaveProperty('npcs')
        expect(config.level).toHaveProperty('npcConfiguration')
      })
    })

    it('should contain level A1 configuration', () => {
      const levelA1Config = levelConfig.find((c) => c.level.name === 'A-1')
      expect(levelA1Config).toBeDefined()
      expect(levelA1Config?.level).toBe(levelA1)
    })

    it('should contain level A2 configuration', () => {
      const levelA2Config = levelConfig.find((c) => c.level.name === 'A-2')
      expect(levelA2Config).toBeDefined()
      expect(levelA2Config?.level).toBe(levelA2)
    })

    it('should have correct level count', () => {
      expect(levelConfig.length).toBe(2)
    })

    it('should have levelA1 connected to levelA2 on the right', () => {
      const levelA1Config = levelConfig.find((c) => c.level.name === 'A-1')
      expect(levelA1Config?.connectedLevels).toBeDefined()
      expect(levelA1Config?.connectedLevels?.length).toBe(1)
      expect(levelA1Config?.connectedLevels?.[0].direction).toBe(
        LevelDirection.RIGHT,
      )
      expect(levelA1Config?.connectedLevels?.[0].level).toBe(levelA2)
    })

    it('should have levelA2 connected to levelA1 on the left', () => {
      const levelA2Config = levelConfig.find((c) => c.level.name === 'A-2')
      expect(levelA2Config?.connectedLevels).toBeDefined()
      expect(levelA2Config?.connectedLevels?.length).toBe(1)
      expect(levelA2Config?.connectedLevels?.[0].direction).toBe(
        LevelDirection.LEFT,
      )
      expect(levelA2Config?.connectedLevels?.[0].level).toBe(levelA1)
    })

    it('should have bidirectional connection between A1 and A2', () => {
      const levelA1Config = levelConfig.find((c) => c.level.name === 'A-1')
      const levelA2Config = levelConfig.find((c) => c.level.name === 'A-2')

      const a1ToA2 = levelA1Config?.connectedLevels?.[0]
      const a2ToA1 = levelA2Config?.connectedLevels?.[0]

      expect(a1ToA2?.level).toBe(levelA2)
      expect(a2ToA1?.level).toBe(levelA1)
    })

    it('should use proper level direction enum values', () => {
      levelConfig.forEach((config) => {
        config.connectedLevels?.forEach((connection) => {
          expect(
            Object.values(LevelDirection).includes(connection.direction),
          ).toBe(true)
        })
      })
    })

    it('should have all levels with unique names', () => {
      const names = levelConfig.map((c) => c.level.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })
  })

  describe('defaultLevel', () => {
    it('should export default level', () => {
      expect(defaultLevel).toBeDefined()
    })

    it('should be levelA1', () => {
      expect(defaultLevel).toBe(levelA1)
    })

    it('should have correct level structure', () => {
      expect(defaultLevel).toHaveProperty('name')
      expect(defaultLevel).toHaveProperty('layersData')
      expect(defaultLevel).toHaveProperty('frontRenderedLayersData')
      expect(defaultLevel).toHaveProperty('tilesets')
      expect(defaultLevel).toHaveProperty('l_Collisions')
      expect(defaultLevel).toHaveProperty('npcs')
      expect(defaultLevel).toHaveProperty('npcConfiguration')
    })

    it('should have name "A-1"', () => {
      expect(defaultLevel.name).toBe('A-1')
    })

    it('should have layers data', () => {
      expect(defaultLevel.layersData).toBeDefined()
      expect(typeof defaultLevel.layersData).toBe('object')
    })

    it('should have front rendered layers data', () => {
      expect(defaultLevel.frontRenderedLayersData).toBeDefined()
      expect(typeof defaultLevel.frontRenderedLayersData).toBe('object')
    })

    it('should have tilesets', () => {
      expect(defaultLevel.tilesets).toBeDefined()
      expect(typeof defaultLevel.tilesets).toBe('object')
    })

    it('should have collision data as 2D array', () => {
      expect(defaultLevel.l_Collisions).toBeDefined()
      expect(Array.isArray(defaultLevel.l_Collisions)).toBe(true)
      if (defaultLevel.l_Collisions.length > 0) {
        expect(Array.isArray(defaultLevel.l_Collisions[0])).toBe(true)
      }
    })

    it('should have npcs array', () => {
      expect(defaultLevel.npcs).toBeDefined()
      expect(Array.isArray(defaultLevel.npcs)).toBe(true)
    })

    it('should have npc configuration array', () => {
      expect(defaultLevel.npcConfiguration).toBeDefined()
      expect(Array.isArray(defaultLevel.npcConfiguration)).toBe(true)
    })
  })

  describe('level data integrity', () => {
    it('should have valid tileset structure for all levels', () => {
      levelConfig.forEach((config) => {
        const { tilesets } = config.level
        Object.values(tilesets).forEach((tileset) => {
          expect(tileset).toHaveProperty('imageUrl')
          expect(tileset).toHaveProperty('tileSize')
          expect(typeof tileset.imageUrl).toBe('string')
          expect(typeof tileset.tileSize).toBe('number')
          expect(tileset.tileSize).toBeGreaterThan(0)
        })
      })
    })

    it('should have matching layer keys between layersData and tilesets', () => {
      levelConfig.forEach((config) => {
        const { layersData, tilesets } = config.level
        Object.keys(layersData).forEach((layerKey) => {
          expect(tilesets).toHaveProperty(layerKey)
        })
      })
    })

    it('should have matching layer keys between frontRenderedLayersData and tilesets', () => {
      levelConfig.forEach((config) => {
        const { frontRenderedLayersData, tilesets } = config.level
        Object.keys(frontRenderedLayersData).forEach((layerKey) => {
          expect(tilesets).toHaveProperty(layerKey)
        })
      })
    })

    it('should have 2D array collision data for all levels', () => {
      levelConfig.forEach((config) => {
        const { l_Collisions } = config.level
        expect(Array.isArray(l_Collisions)).toBe(true)
        if (l_Collisions.length > 0) {
          expect(Array.isArray(l_Collisions[0])).toBe(true)
          l_Collisions.forEach((row) => {
            expect(Array.isArray(row)).toBe(true)
          })
        }
      })
    })
  })
})
