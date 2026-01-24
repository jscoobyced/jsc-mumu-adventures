import { CharacterInitializationOptions, Keys } from '../models'
import { PlayerData } from '../models/CurrentStatusData'
import { LevelDirection } from '../models/LevelData'
import { characterSprites } from '../sprites'
import { jscLog } from '../utils/log'
import { Character } from './Character'
import { CollisionBlock } from './CollisionBlock'

const X_VELOCITY = 120
const Y_VELOCITY = 120

export class Player extends Character {
  private objects: string[] = []

  constructor(
    initializationOptions: CharacterInitializationOptions,
    initialInventory: string[] = [],
  ) {
    super(initializationOptions)

    this.invincibilityInterval = 0.8
    this.currentSprite = initializationOptions.sprites.walkDown
    this.objects = [...initialInventory]
  }

  public draw(c: CanvasRenderingContext2D): void {
    if (!this.imageLoaded) return
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
  }

  public update(
    deltaTime: number,
    collisionBlocks: CollisionBlock[],
  ): LevelDirection {
    if (!deltaTime) return LevelDirection.NONE

    this.updateInvincibility(deltaTime)
    this.updateAnimation(deltaTime)
    return this.updatePosition(deltaTime, collisionBlocks)
  }

  public handleInput(keys: Keys): void {
    this.velocity.x = 0
    this.velocity.y = 0
    if (!this.currentSprite) return
    this.currentSprite.frameCount = 4

    if (keys.d.pressed) {
      this.currentSprite = characterSprites.walkRight
      this.velocity.x = X_VELOCITY
    }
    if (keys.a.pressed) {
      this.currentSprite = characterSprites.walkLeft
      this.velocity.x = -X_VELOCITY
    }
    if (keys.w.pressed) {
      this.currentSprite = characterSprites.walkUp
      this.velocity.y = -Y_VELOCITY
    }
    if (keys.s.pressed) {
      this.currentSprite = characterSprites.walkDown
      this.velocity.y = Y_VELOCITY
    }
    if (keys.g.pressed) {
      this.objectFound('coffee')
    }

    if (this.velocity.x === 0 && this.velocity.y === 0) {
      this.currentSprite.frameCount = 1
    }

    if (this.velocity.x !== 0 && this.velocity.y !== 0) {
      this.velocity.x *= Math.SQRT1_2
      this.velocity.y *= Math.SQRT1_2
    }
  }

  public hasObject(object: string): boolean {
    return this.objects.includes(object)
  }

  public objectFound(object: string): void {
    if (!this.hasObject(object)) {
      jscLog(`Picked up a ${object}!`)
      this.objects.push(object.toLocaleLowerCase())
    }
  }

  public getObject(object: string): string {
    return this.objects.includes(object)
      ? this.objects.find((obj) => obj === object)!
      : ''
  }

  public removeObject(object: string): void {
    this.objects = this.objects.filter((obj) => obj !== object)
  }

  public getCurrentPlayerData(): PlayerData {
    return {
      position: this.position,
      inventory: this.objects,
    }
  }
}

export default Player
