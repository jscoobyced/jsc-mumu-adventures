import ActiveNpc from '../classes/ActiveNpc'
import InteractiveNpc from '../classes/InteractiveNpc'
import {
  NpcInitializationOptions,
  TalkingNpcInitializationOptions,
} from '../models/CharacterInitializationOptions'
import { NpcData } from '../models/CurrentStatusData'
import { NpcConfiguration } from '../models/NpcConfiguration'
import { characterSprites } from '../sprites'
import { getJscData } from '../utils/window'

export const initializeNpcs = (name: string, npcs: NpcConfiguration[]) => {
  const newNpcs: (InteractiveNpc | ActiveNpc)[] = []
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
    if (npcData.type === 'InteractiveNpc') {
      const newNpc = new InteractiveNpc(
        initializationOptions,
        savedNpc?.interaction,
      )
      newNpcs.push(newNpc)
    } else if (npcData.type === 'ActiveNpc') {
      const initOption: NpcInitializationOptions = {
        characterInitializationOptions:
          initializationOptions.npcInitializationOptions
            .characterInitializationOptions,
        attacking: true,
      }
      const newNpc = new ActiveNpc(initOption)
      newNpcs.push(newNpc)
    }
  }
  return newNpcs
}
