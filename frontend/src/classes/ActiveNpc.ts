import { NpcInitializationOptions } from '../models/CharacterInitializationOptions'
import SimpleNpc from './SimpleNpc'

export class ActiveNpc extends SimpleNpc {
  private attacking: boolean

  constructor(npcInitializationOptions: NpcInitializationOptions) {
    super(npcInitializationOptions.characterInitializationOptions)

    this.health =
      npcInitializationOptions.characterInitializationOptions.health || 3
    this.elapsedMovementTime = 0
    this.invincibilityInterval = 3
    this.attacking = npcInitializationOptions.attacking || false
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
