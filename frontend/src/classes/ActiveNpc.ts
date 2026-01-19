import { TalkingNpcInitializationOptions } from '../models/CharacterInitializationOptions'
import { characterSprites } from '../sprites'
import SimpleNpc from './SimpleNpc'

export class ActiveNpc extends SimpleNpc {
  private attacking: boolean

  constructor({
    position,
    size,
    imageSrc,
    velocity = { x: 0, y: 0 },
    health = 3,
    attacking = false,
  }: TalkingNpcInitializationOptions) {
    super({
      position,
      size,
      imageSrc,
      velocity,
      health,
    })

    this.originalPosition = { ...position }
    this.health = health
    this.elapsedMovementTime = 0
    this.invincibilityInterval = 3
    this.attacking = attacking

    this.loadImage(imageSrc)

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
