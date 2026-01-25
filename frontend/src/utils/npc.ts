import InteractiveNpc from '../classes/InteractiveNpc'
import { TalkingNpcInitializationOptions } from '../models/CharacterInitializationOptions'
import { NpcData } from '../models/CurrentStatusData'
import { NpcConfiguration } from '../models/NpcConfiguration'
import { characterSprites } from '../sprites'
import { getJscData } from '../utils/window'

export const initializeNpcs = (name: string, npcs: NpcConfiguration[]) => {
  const newNpcs: InteractiveNpc[] = []
  const savedLevelData = getJscData().currentStatusData?.levelsData
  const savedNpcs: NpcData[] = []
  if (savedLevelData) {
    const savedLevel = savedLevelData.find(
      (levelData) => levelData.levelName === name,
    )
    if (savedLevel) {
      savedNpcs.push(...savedLevel.npcData)
    }
  }

  for (const npcData of npcs) {
    if (npcData.type === 'TalkingNpc') {
      const initializationOptions: TalkingNpcInitializationOptions = {
        npcInitializationOptions: {
          characterInitializationOptions: {
            position: { x: npcData.position.x, y: npcData.position.y },
            size: npcData.size,
            velocity: { x: 0, y: 0 },
            imageSrc: npcData.imageSrc,
            sprites: characterSprites,
            health: npcData.health,
            name: npcData.name,
          },
          attacking: false,
        },
        messages: npcData.messages,
        expectedObject: npcData.expectedObject,
        postObjectMessages: npcData.postObjectMessages,
        waitingMessages: npcData.waitingMessages,
        finalMessages: npcData.finalMessages,
        portraitImageSrc: npcData.portraitImageSrc,
      }
      let savedNpc = savedNpcs.find((npc) => npc.npcName === npcData.name)

      const newNpc = new InteractiveNpc(
        initializationOptions,
        savedNpc?.interaction,
      )
      newNpcs.push(newNpc)
    }
  }
  return newNpcs
}
