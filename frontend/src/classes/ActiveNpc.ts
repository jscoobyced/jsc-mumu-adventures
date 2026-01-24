import { NpcInitializationOptions } from '../models/CharacterInitializationOptions'
import { characterSprites } from '../sprites'
import SimpleNpc from './SimpleNpc'

export class ActiveNpc extends SimpleNpc {
  private attacking: boolean

  constructor(npcInitializationOptions: NpcInitializationOptions) {
    super(npcInitializationOptions.characterInitializationOptions)

    this.originalPosition = {
      ...npcInitializationOptions.characterInitializationOptions.position,
    }
    this.health =
      npcInitializationOptions.characterInitializationOptions.health || 3
    this.elapsedMovementTime = 0
    this.invincibilityInterval = 3
    this.attacking = npcInitializationOptions.attacking || false

    this.loadImage(
      npcInitializationOptions.characterInitializationOptions.imageSrc,
    )

    if (characterSprites === undefined) {
      throw new Error('NPC sprites is undefined')
    }
    this.currentSprite = Object.values(characterSprites)[0]
  }

  public isAttacking = (): boolean => {
    return this.attacking
  }

  public setInvincible(): void {
    this.isInvincible = true
  }

  public hitReceived(): void {
    if (this.isInvincible) return

    this.health--
    this.isInvincible = true
  }
}

export default ActiveNpc
