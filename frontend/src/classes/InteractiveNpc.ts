import { TalkingNpcInitializationOptions } from '../models/CharacterInitializationOptions'
import ActiveNpc from './ActiveNpc'

export class InteractiveNpc extends ActiveNpc {
  private messages: string[]
  private isKeyNpc: boolean
  private expectedObject?: string
  private hasReceivedObject: boolean
  private postObjectMessages: string[]

  constructor(initializationOptions: TalkingNpcInitializationOptions) {
    super(initializationOptions.npcInitializationOptions)

    this.messages = initializationOptions.messages
      ? [...initializationOptions.messages]
      : []
    this.isKeyNpc =
      initializationOptions.isKeyNpc ||
      initializationOptions.expectedObject !== undefined
    this.expectedObject = initializationOptions.expectedObject?.toLowerCase()
    this.hasReceivedObject = false
    this.postObjectMessages = initializationOptions.postObjectMessages
      ? [...initializationOptions.postObjectMessages]
      : []
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
