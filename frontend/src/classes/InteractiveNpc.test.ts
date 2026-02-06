import { describe, expect, it, vi, beforeEach } from 'vitest'
import { InteractiveNpc } from './InteractiveNpc'
import Interaction from '../models/Interaction'

vi.mock('../config.json', () => ({
  default: {
    tileSize: 16,
    cols: 50,
    rows: 50,
  },
}))

vi.mock('../utils/loadImage', () => ({
  loadImage: vi.fn((src: string) =>
    Promise.resolve(Object.assign(new Image(), { src })),
  ),
}))

describe('InteractiveNpc', () => {
  const mockSprites = {
    walkDown: { x: 0, y: 0, width: 16, height: 16, frameCount: 4 },
    walkUp: { x: 0, y: 16, width: 16, height: 16, frameCount: 4 },
    walkLeft: { x: 0, y: 32, width: 16, height: 16, frameCount: 4 },
    walkRight: { x: 0, y: 48, width: 16, height: 16, frameCount: 4 },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create interactive NPC with messages', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
          name: 'Villager',
        },
      },
      messages: ['Hello!', 'How are you?'],
      expectedObject: 'key',
      postObjectMessages: ['Thanks for the key!'],
      waitingMessages: ['Do you have a key?'],
      finalMessages: ['Goodbye!'],
    })

    expect(npc.getName()).toBe('Villager')
  })

  it('should start with NONE interaction', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: '',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    const data = npc.getCurrentNpcData()
    expect(data.interaction).toBe(Interaction.NONE)
  })

  it('should transition to WAITING when getting messages for first time', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'key',
      postObjectMessages: [],
      waitingMessages: ['I need a key'],
      finalMessages: [],
    })

    const messages = npc.getMessages()
    expect(messages).toEqual(['Hello!'])

    const data = npc.getCurrentNpcData()
    expect(data.interaction).toBe(Interaction.WAITING)
  })

  it('should accept expected object when in WAITING state', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'key',
      postObjectMessages: ['Thanks!'],
      waitingMessages: ['I need a key'],
      finalMessages: [],
    })

    // Trigger WAITING state
    npc.getMessages()

    const result = npc.receiveObjectFromPlayer('key')

    expect(result).toBe(true)
    const data = npc.getCurrentNpcData()
    expect(data.interaction).toBe(Interaction.OBJECT)
  })

  it('should not accept wrong object', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'key',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    npc.getMessages()

    const result = npc.receiveObjectFromPlayer('sword')

    expect(result).toBe(false)
  })

  it('should handle case-insensitive object names', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'KEY',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    npc.getMessages()

    const result = npc.receiveObjectFromPlayer('key')

    expect(result).toBe(true)
  })

  it('should return expected object name', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'sword',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    expect(npc.expectingObjectName()).toBe('sword')
  })

  it('should return false when not expecting an object', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: undefined,
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    expect(npc.expectingObjectName()).toBe(false)
  })

  it('should check if expecting specific object', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'potion',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    npc.getMessages() // Trigger WAITING state

    expect(npc.isExpectingSpecificObject('potion')).toBe(true)
    expect(npc.isExpectingSpecificObject('sword')).toBe(false)
  })

  it('should return post-object messages after receiving object', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'key',
      postObjectMessages: ['Thanks for the key!', 'Here is your reward'],
      waitingMessages: [],
      finalMessages: [],
    })

    npc.getMessages()
    npc.receiveObjectFromPlayer('key')

    const messages = npc.getMessages()
    expect(messages).toEqual(['Thanks for the key!', 'Here is your reward'])
  })

  it('should return final messages after completing interaction', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'key',
      postObjectMessages: ['Thanks!'],
      waitingMessages: [],
      finalMessages: ['Goodbye!', 'See you later'],
    })

    npc.getMessages()
    npc.receiveObjectFromPlayer('key')
    npc.getMessages() // Get post-object messages, transition to DONE

    const messages = npc.getMessages()
    expect(messages).toEqual(['Goodbye!', 'See you later'])

    const data = npc.getCurrentNpcData()
    expect(data.interaction).toBe(Interaction.DONE)
  })

  it('should use waiting messages when available', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'key',
      postObjectMessages: [],
      waitingMessages: ['Please bring me a key'],
      finalMessages: [],
    })

    npc.setInteraction(Interaction.WAITING)

    const messages = npc.getMessages()
    expect(messages).toEqual(['Please bring me a key'])
  })

  it('should load portrait image when provided', async () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: '',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
      portraitImageSrc: './portrait.png',
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    const portrait = npc.getPortraitImageSrc()
    expect(portrait).toBeDefined()
  })

  it('should return undefined portrait when not provided', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: '',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    const portrait = npc.getPortraitImageSrc()
    expect(portrait).toBeUndefined()
  })

  it('should initialize with custom interaction state', () => {
    const npc = new InteractiveNpc(
      {
        npcInitializationOptions: {
          characterInitializationOptions: {
            position: { x: 200, y: 300 },
            size: 15,
            imageSrc: './npc.png',
            velocity: { x: 0, y: 0 },
            sprites: mockSprites,
            health: 3,
          },
        },
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
      },
      Interaction.DONE,
    )

    const data = npc.getCurrentNpcData()
    expect(data.interaction).toBe(Interaction.DONE)
  })

  it('should convert toString correctly', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
          name: 'Bob',
        },
      },
      messages: ['Hello!'],
      expectedObject: 'key',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    const str = npc.toString()

    expect(str).toContain('Bob')
    expect(str).toContain('key')
    expect(str).toContain('InteractiveNpc')
  })

  it('should handle toString with unknown name', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: undefined,
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    const str = npc.toString()

    expect(str).toContain('unknown')
    expect(str).toContain('none')
  })

  it('should not accept object when not in WAITING state', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Hello!'],
      expectedObject: 'key',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    // Don't transition to WAITING
    const result = npc.receiveObjectFromPlayer('key')

    expect(result).toBe(false)
  })

  it('should use default messages when specialized messages are empty', () => {
    const npc = new InteractiveNpc({
      npcInitializationOptions: {
        characterInitializationOptions: {
          position: { x: 200, y: 300 },
          size: 15,
          imageSrc: './npc.png',
          velocity: { x: 0, y: 0 },
          sprites: mockSprites,
          health: 3,
        },
      },
      messages: ['Default message'],
      expectedObject: '',
      postObjectMessages: [],
      waitingMessages: [],
      finalMessages: [],
    })

    npc.setInteraction(Interaction.WAITING)
    const waitingMessages = npc.getMessages()
    expect(waitingMessages).toEqual(['Default message'])

    npc.setInteraction(Interaction.OBJECT)
    const objectMessages = npc.getMessages()
    expect(objectMessages).toEqual(['Default message'])

    npc.setInteraction(Interaction.DONE)
    const doneMessages = npc.getMessages()
    expect(doneMessages).toEqual(['Default message'])
  })

  it('should not change interaction on NONE', () => {
    const npc = new InteractiveNpc(
      {
        npcInitializationOptions: {
          characterInitializationOptions: {
            position: { x: 200, y: 300 },
            size: 15,
            imageSrc: './npc.png',
            velocity: { x: 0, y: 0 },
            sprites: mockSprites,
            health: 3,
          },
        },
        messages: ['Hello!'],
        expectedObject: '',
        postObjectMessages: [],
        waitingMessages: [],
        finalMessages: [],
      },
      Interaction.DONE,
    )

    npc.setInteraction(Interaction.NONE)

    const data = npc.getCurrentNpcData()
    expect(data.interaction).toBe(Interaction.DONE)
  })
})
