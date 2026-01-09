import { Vector } from '../models'
import { NpcInitializationOptions } from '../models/CharacterInitializationOptions'
import { characterSprites } from '../sprites'
import { Character } from './Character'
import { CollisionBlock } from './CollisionBlock'

export class Npc extends Character {
  public originalPosition: Vector
  public health: number
  public elapsedMovementTime: number
  private attacking: boolean
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
  }: NpcInitializationOptions) {
    super(position, size, velocity)

    this.originalPosition = { ...position }
    this.health = health
    this.elapsedMovementTime = 0
    this.invincibilityInterval = 3
    this.attacking = attacking
    this.messages = [...messages]
    this.isKeyNpc = isKeyNpc
    this.expectedObject = expectedObject
    this.hasReceivedObject = false
    this.postObjectMessages = [...postObjectMessages]

    this.loadImage(imageSrc)

    if (characterSprites === undefined) {
      throw new Error('NPC sprites is undefined')
    }
    this.currentSprite = Object.values(characterSprites)[0]
  }

  public getMessage = (): string | undefined => {
    if (this.isInvincible) return undefined
    // Key NPC logic
    if (this.isKeyNpc) {
      if (!this.hasReceivedObject) {
        return this.getNextOrLastMessage()
      } else {
        // NPC has received the object, deliver post-object messages then stop
        if (this.postObjectMessages.length > 0) {
          return this.postObjectMessages.shift()
        } else {
          return undefined
        }
      }
    }
    // Simple NPC: pick a random message
    return this.getNextOrLastMessage()
  }

  private getNextOrLastMessage = (): string => {
    if (this.messages.length > 1) {
      return this.messages.shift()!
    } else if (this.messages.length === 1) {
      return this.messages[0]
    }
    return ''
  }

  public isAttacking = (): boolean => {
    return this.attacking
  }

  public collide(): void {
    if (this.isInvincible) return

    this.health--
    this.isInvincible = true
  }

  public draw(c: CanvasRenderingContext2D): void {
    if (!this.imageLoaded) return

    let alpha = 1
    if (this.isInvincible) alpha = 0.5
    c.save()
    c.globalAlpha = alpha
    if (!this.currentSprite) return
    c.drawImage(
      this.image,
      this.currentSprite.x + this.currentFrame * this.currentSprite.width,
      this.currentSprite.y,
      this.currentSprite.width,
      this.currentSprite.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    )
    c.restore()
  }

  public update(deltaTime: number, collisionBlocks: CollisionBlock[]): void {
    if (!deltaTime) return

    this.updateInvincibility(deltaTime)
    this.updateAnimation(deltaTime)
    this.setVelocity(deltaTime)
    this.updatePosition(deltaTime, collisionBlocks)
  }

  private setVelocity(deltaTime: number): void {
    const changeDirectionInterval = 1
    if (
      this.elapsedMovementTime > changeDirectionInterval ||
      this.elapsedMovementTime === 0
    ) {
      this.elapsedMovementTime -= changeDirectionInterval

      const angle = Math.random() * Math.PI * 2
      const CIRCLE_RADIUS = 20

      const targetLocation: Vector = {
        x: this.originalPosition.x + Math.cos(angle) * CIRCLE_RADIUS,
        y: this.originalPosition.y + Math.sin(angle) * CIRCLE_RADIUS,
      }

      const deltaX = targetLocation.x - this.position.x
      const deltaY = targetLocation.y - this.position.y

      const hypotenuse = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const normalizedDeltaX = deltaX / hypotenuse
      const normalizedDeltaY = deltaY / hypotenuse

      this.velocity.x = normalizedDeltaX * CIRCLE_RADIUS
      this.velocity.y = normalizedDeltaY * CIRCLE_RADIUS
    }

    this.currentSprite = Object.values(characterSprites)[0]
    if (this.velocity.x > 0) {
      this.currentSprite = characterSprites.walkRight
    } else if (this.velocity.x < 0) {
      this.currentSprite = characterSprites.walkLeft
    }
    this.elapsedMovementTime += deltaTime
  }

  protected onHorizontalCollision(): void {
    this.velocity.x = -this.velocity.x
  }

  protected onVerticalCollision(): void {
    this.velocity.y = -this.velocity.y
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
      return true
    }
    return false
  }
}

export default Npc
