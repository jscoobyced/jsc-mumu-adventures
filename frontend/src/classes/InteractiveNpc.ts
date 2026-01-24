import { TalkingNpcInitializationOptions } from '../models/CharacterInitializationOptions'
import { loadImage } from '../utils/loadImage'
import ActiveNpc from './ActiveNpc'

export class InteractiveNpc extends ActiveNpc {
  private messages: string[]
  private isKeyNpc: boolean
  private expectedObject?: string
  private hasReceivedObject: boolean
  private postObjectMessages: string[]
  private waitingMessages: string[]
  private finalMessages: string[]
  private portraitImage?: HTMLImageElement

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
    this.waitingMessages = initializationOptions.waitingMessages
    this.finalMessages = initializationOptions.finalMessages
    if (initializationOptions.portraitImageSrc)
      loadImage(initializationOptions.portraitImageSrc).then((img) => {
        this.portraitImage = img
      })
  }

  public getMessages = (): string[] => {
    return this.messages
  }

  public setHasSpoken = () => {
    this.setInvincible()
    if (this.hasReceivedObject && this.finalMessages.length > 0) {
      this.messages = this.finalMessages
      return
    }
    if (this.waitingMessages) this.messages = this.waitingMessages
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

  public getPortraitImageSrc(): HTMLImageElement | undefined {
    return this.portraitImage
  }
}

export default InteractiveNpc
