import { TalkingNpcInitializationOptions } from '../models/CharacterInitializationOptions'
import { characterSprites } from '../sprites'
import ActiveNpc from './ActiveNpc'

export class InteractiveNpc extends ActiveNpc {
  private messages: string[]
  private isKeyNpc: boolean
  private expectedObject?: string
  private hasReceivedObject: boolean
  private postObjectMessages: string[]

  constructor({
    position,
    size,
    imageSrc,
    velocity = { x: 0, y: 0 },
    health = 3,
    attacking = false,
    messages = [],
    isKeyNpc = false,
    expectedObject,
    postObjectMessages = [],
  }: TalkingNpcInitializationOptions) {
    super({
      position,
      size,
      imageSrc,
      velocity,
      health,
      attacking,
    })

    this.originalPosition = { ...position }
    this.health = health
    this.elapsedMovementTime = 0
    this.invincibilityInterval = 3
    this.messages = [...messages]
    this.isKeyNpc = isKeyNpc || expectedObject !== undefined
    this.expectedObject = expectedObject?.toLowerCase()
    this.hasReceivedObject = false
    this.postObjectMessages = [...postObjectMessages]

    this.loadImage(imageSrc)

    if (characterSprites === undefined) {
      throw new Error('NPC sprites is undefined')
    }
    this.currentSprite = Object.values(characterSprites)[0]
  }

  public getMessages = (): string[] => {
    return this.messages
  }

  /**
   * Call this when the Player gives the expected object to the NPC
   */
  public receiveObjectFromPlayer(objectName: string): boolean {
    if (
      this.isKeyNpc &&
      this.expectedObject === objectName &&
      !this.hasReceivedObject
    ) {
      this.hasReceivedObject = true
      this.messages = [...this.postObjectMessages]
      return true
    }
    return false
  }

  public expectingObjectName(): string | false {
    if (
      this.isKeyNpc &&
      !this.hasReceivedObject &&
      this.expectedObject !== undefined
    ) {
      return this.expectedObject
    }
    return false
  }

  public isExpectingSpecificObject(object: string): boolean {
    return (
      this.isKeyNpc &&
      !this.hasReceivedObject &&
      this.expectedObject !== undefined &&
      this.expectedObject === object
    )
  }
}

export default InteractiveNpc
