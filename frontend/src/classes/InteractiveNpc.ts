import { TalkingNpcInitializationOptions } from '../models/CharacterInitializationOptions'
import { NpcData } from '../models/CurrentStatusData'
import Interaction from '../models/Interaction'
import { loadImage } from '../utils/loadImage'
import ActiveNpc from './ActiveNpc'

export class InteractiveNpc extends ActiveNpc {
  private messages: string[]
  private expectedObject?: string
  private objectToGive?: string
  private objectGiven?: boolean
  private postObjectMessages: string[]
  private waitingMessages: string[]
  private finalMessages: string[]
  private portraitImage?: HTMLImageElement
  private currentInteraction: Interaction = Interaction.NONE

  constructor(
    initializationOptions: TalkingNpcInitializationOptions,
    initialInteraction: Interaction = Interaction.NONE,
  ) {
    super(initializationOptions.npcInitializationOptions)

    this.messages = [...initializationOptions.messages]
    this.expectedObject = initializationOptions.expectedObject?.toLowerCase()
    this.objectToGive = initializationOptions.objectToGive?.toLowerCase()
    this.postObjectMessages = [...initializationOptions.postObjectMessages]
    this.waitingMessages = [...initializationOptions.waitingMessages]
    this.finalMessages = [...initializationOptions.finalMessages]
    if (initializationOptions.portraitImageSrc)
      loadImage(initializationOptions.portraitImageSrc).then((img) => {
        this.portraitImage = img
      })
    this.setInteraction(initialInteraction)
  }

  public toString = (): string => {
    return `InteractiveNpc:\n\t${this.getName() || 'unknown'}\n\tInteraction: ${this.currentInteraction}\n\tExpected Object: ${
      this.expectedObject || 'none'
    }\n\tObject Given: ${this.objectToGive || 'none'}
    }`
  }

  public setInteraction = (interaction: Interaction) => {
    switch (interaction) {
      case Interaction.WAITING:
        this.currentInteraction = interaction
        this.messages = this.waitingMessages.length
          ? [...this.waitingMessages]
          : this.messages
        break
      case Interaction.OBJECT:
        this.currentInteraction = interaction
        this.messages = this.postObjectMessages.length
          ? [...this.postObjectMessages]
          : this.messages
        break
      case Interaction.DONE:
        this.currentInteraction = interaction
        this.messages = this.finalMessages.length
          ? [...this.finalMessages]
          : this.messages
        break
      case Interaction.NONE:
      default:
        // Do nothing
        break
    }
  }

  public getMessages = (): string[] => {
    const currentMessages = [...this.messages]
    if (this.currentInteraction === Interaction.OBJECT) {
      this.setInteraction(Interaction.DONE)
    }
    if (this.currentInteraction === Interaction.NONE) {
      this.setInteraction(Interaction.WAITING)
    }
    return currentMessages
  }

  /**
   * Call this when the Player gives the expected object to the NPC
   */
  public receiveObjectFromPlayer(objectName: string): boolean {
    if (
      this.expectedObject === objectName.toLowerCase() &&
      this.currentInteraction === Interaction.WAITING
    ) {
      this.setInteraction(Interaction.OBJECT)
      return true
    }
    return false
  }

  public giveObjectToPlayer(): string | false {
    if (this.objectGiven) {
      this.setInteraction(Interaction.DONE)
      return false
    }
    if (this.objectToGive) {
      this.objectGiven = true
      return this.objectToGive
    }
    return false
  }

  public expectingObjectName(): string | false {
    if (this.expectedObject !== undefined) {
      return this.expectedObject
    }
    return false
  }

  public isExpectingSpecificObject(object: string): boolean {
    return (
      this.currentInteraction === Interaction.WAITING &&
      this.expectedObject !== undefined &&
      this.expectedObject === object
    )
  }

  public getPortraitImageSrc(): HTMLImageElement | undefined {
    return this.portraitImage
  }

  public getCurrentNpcData(): NpcData {
    return {
      npcName: this.getName() || 'unknown',
      interaction: this.currentInteraction,
    }
  }
}

export default InteractiveNpc
