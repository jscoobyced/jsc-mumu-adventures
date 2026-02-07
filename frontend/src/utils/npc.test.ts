import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeNpcs } from './npc'
import { NpcConfiguration } from '../models/NpcConfiguration'
import { Interaction } from '../models/Interaction'
import ActiveNpc from '../classes/ActiveNpc'
import * as window from './window'

vi.mock('../sprites', () => ({
  characterSprites: {
    walkDown: { x: 0, y: 0, width: 16, height: 16, frameCount: 4 },
    walkUp: { x: 0, y: 16, width: 16, height: 16, frameCount: 4 },
    walkLeft: { x: 0, y: 32, width: 16, height: 16, frameCount: 4 },
    walkRight: { x: 0, y: 48, width: 16, height: 16, frameCount: 4 },
  },
}))

vi.mock('../utils/loadImage', () => ({
  loadImage: vi.fn((src: string) =>
    Promise.resolve(Object.assign(new Image(), { src })),
  ),
}))

describe('npc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initializeNpcs', () => {
    it('should return empty array when no npcs provided', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const result = initializeNpcs('A-1', [])

      expect(result).toEqual([])
    })

    it('should create InteractiveNpc when type is InteractiveNpc', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'InteractiveNpc',
        name: 'TestNpc',
        position: { x: 100, y: 100 },
        size: 15,
        imageSrc: './npc.png',
        health: 3,
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: './portrait.png',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result).toHaveLength(1)
    })

    it('should create ActiveNpc when type is ActiveNpc', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'ActiveNpc',
        name: 'EnemyNpc',
        position: { x: 200, y: 200 },
        size: 15,
        imageSrc: './enemy.png',
        health: 3,
        messages: [],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: '',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result).toHaveLength(1)
    })

    it('should create multiple npcs', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const npcConfigs: NpcConfiguration[] = [
        {
          type: 'InteractiveNpc',
          name: 'Npc1',
          position: { x: 100, y: 100 },
          size: 15,
          imageSrc: './npc1.png',
          health: 3,
          messages: ['Hello!'],
          expectedObject: '',
          postObjectMessages: [],
          waitingMessages: [],
          finalMessages: [],
          portraitImageSrc: './portrait1.png',
        },
        {
          type: 'ActiveNpc',
          name: 'Npc2',
          position: { x: 200, y: 200 },
          size: 15,
          imageSrc: './npc2.png',
          health: 3,
          messages: [],
          expectedObject: '',
          postObjectMessages: [],
          waitingMessages: [],
          finalMessages: [],
          portraitImageSrc: '',
        },
      ]

      const result = initializeNpcs('A-1', npcConfigs)

      expect(result).toHaveLength(2)
    })

    it('should use saved interaction state when available', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: {
          levelsData: [
            {
              levelName: 'A-1',
              npcData: [
                {
                  npcName: 'TestNpc',
                  interaction: Interaction.OBJECT,
                },
              ],
            },
          ],
        },
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'InteractiveNpc',
        name: 'TestNpc',
        position: { x: 100, y: 100 },
        size: 15,
        imageSrc: './npc.png',
        health: 3,
        messages: ['Hello!'],
        expectedObject: 'key',
        postObjectMessages: ['Thanks!'],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: './portrait.png',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result).toHaveLength(1)
    })

    it('should handle level without saved data', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: {
          levelsData: [
            {
              levelName: 'A-2',
              npcData: [],
            },
          ],
        },
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'InteractiveNpc',
        name: 'TestNpc',
        position: { x: 100, y: 100 },
        size: 15,
        imageSrc: './npc.png',
        health: 3,
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: './portrait.png',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result).toHaveLength(1)
    })

    it('should set correct position from config', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'InteractiveNpc',
        name: 'TestNpc',
        position: { x: 150, y: 250 },
        size: 15,
        imageSrc: './npc.png',
        health: 3,
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: './portrait.png',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result[0].position.x).toBe(150)
      expect(result[0].position.y).toBe(250)
    })

    it('should set correct size from config', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'InteractiveNpc',
        name: 'TestNpc',
        position: { x: 100, y: 100 },
        size: 20,
        imageSrc: './npc.png',
        health: 3,
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: './portrait.png',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result[0].width).toBe(20)
      expect(result[0].height).toBe(20)
    })

    it('should set correct health from config', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'InteractiveNpc',
        name: 'TestNpc',
        position: { x: 100, y: 100 },
        size: 15,
        imageSrc: './npc.png',
        health: 5,
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: './portrait.png',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result[0].health).toBe(5)
    })

    it('should handle NPC without saved state', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: {
          levelsData: [
            {
              levelName: 'A-1',
              npcData: [
                {
                  npcName: 'OtherNpc',
                  interaction: Interaction.NONE,
                },
              ],
            },
          ],
        },
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'InteractiveNpc',
        name: 'TestNpc',
        position: { x: 100, y: 100 },
        size: 15,
        imageSrc: './npc.png',
        health: 3,
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: './portrait.png',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result).toHaveLength(1)
    })

    it('should ignore unknown NPC types', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const npcConfig = {
        type: 'UnknownType',
        name: 'TestNpc',
        position: { x: 100, y: 100 },
        size: 15,
        imageSrc: './npc.png',
        health: 3,
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: './portrait.png',
      } as never

      const result = initializeNpcs('A-1', [npcConfig])

      expect(result).toHaveLength(0)
    })

    it('should set ActiveNpc as attacking', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        currentStatusData: undefined,
      } as never)

      const npcConfig: NpcConfiguration = {
        type: 'ActiveNpc',
        name: 'EnemyNpc',
        position: { x: 200, y: 200 },
        size: 15,
        imageSrc: './enemy.png',
        health: 3,
        messages: [],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
        portraitImageSrc: '',
      }

      const result = initializeNpcs('A-1', [npcConfig])

      expect((result[0] as ActiveNpc).isAttacking()).toBe(true)
    })
  })
})
