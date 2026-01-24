import { Vector } from '../models'
import { CharacterInitializationOptions } from '../models/CharacterInitializationOptions'
import { characterSprites } from '../sprites'
import { Character } from './Character'
import { CollisionBlock } from './CollisionBlock'

export class SimpleNpc extends Character {
  public elapsedMovementTime: number
  private originalPosition: Vector

  constructor(initializationOptions: CharacterInitializationOptions) {
    super(initializationOptions)

    this.elapsedMovementTime = 0
    this.originalPosition = { ...initializationOptions.position }
    this.health = initializationOptions.health

    this.currentSprite = initializationOptions.sprites.walkDown
  }

  public draw(c: CanvasRenderingContext2D): void {
    if (!this.imageLoaded) return

    c.save()
    c.globalAlpha = this.isInvincible ? 0.5 : 1
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
}

export default SimpleNpc
