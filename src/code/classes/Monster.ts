import { Vector, CharacterInitializationOptions } from "../models";
import { CollisionBlock } from "./CollisionBlock";
import { Character } from "./Character";
import { characterSprites } from "../sprites";

export class Monster extends Character {
  public originalPosition: Vector;
  public health: number;
  public elapsedMovementTime: number;

  constructor({
    x,
    y,
    size,
    imageSrc,
    velocity = { x: 0, y: 0 },
    health = 3,
  }: CharacterInitializationOptions) {
    super(x, y, size, velocity);

    this.originalPosition = { x, y };
    this.health = health;
    this.elapsedMovementTime = 0;
    this.invincibilityInterval = 0.3;

    this.loadImage(imageSrc);

    if (characterSprites === undefined) {
      throw new Error("Monster sprites is undefined");
    }
    this.currentSprite = Object.values(characterSprites)[0];
  }

  public receiveHit(): void {
    if (this.isInvincible) return;

    this.health--;
    this.isInvincible = true;
  }

  public draw(c: CanvasRenderingContext2D): void {
    if (!this.imageLoaded) return;

    let alpha = 1;
    if (this.isInvincible) alpha = 0.5;
    c.save();
    c.globalAlpha = alpha;
    if (!this.currentSprite) return;
    c.drawImage(
      this.image,
      this.currentSprite.x,
      this.currentSprite.height * this.currentFrame + 0.5,
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    c.restore();
  }

  public update(deltaTime: number, collisionBlocks: CollisionBlock[]): void {
    if (!deltaTime) return;

    this.updateInvincibility(deltaTime);
    this.updateAnimation(deltaTime);
    this.setVelocity(deltaTime);
    this.updatePosition(deltaTime, collisionBlocks);
  }

  private setVelocity(deltaTime: number): void {
    const changeDirectionInterval = 1;
    if (
      this.elapsedMovementTime > changeDirectionInterval ||
      this.elapsedMovementTime === 0
    ) {
      this.elapsedMovementTime -= changeDirectionInterval;

      const angle = Math.random() * Math.PI * 2;
      const CIRCLE_RADIUS = 20;

      const targetLocation: Vector = {
        x: this.originalPosition.x + Math.cos(angle) * CIRCLE_RADIUS,
        y: this.originalPosition.y + Math.sin(angle) * CIRCLE_RADIUS,
      };

      const deltaX = targetLocation.x - this.x;
      const deltaY = targetLocation.y - this.y;

      const hypotenuse = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normalizedDeltaX = deltaX / hypotenuse;
      const normalizedDeltaY = deltaY / hypotenuse;

      this.velocity.x = normalizedDeltaX * CIRCLE_RADIUS;
      this.velocity.y = normalizedDeltaY * CIRCLE_RADIUS;
    }

    this.currentSprite = Object.values(characterSprites)[0];
    if (this.velocity.x > 0) {
      this.currentSprite = characterSprites.walkRight;
    } else if (this.velocity.x < 0) {
      this.currentSprite = characterSprites.walkLeft;
    }
    this.elapsedMovementTime += deltaTime;
  }

  protected onHorizontalCollision(): void {
    this.velocity.x = -this.velocity.x;
  }

  protected onVerticalCollision(): void {
    this.velocity.y = -this.velocity.y;
  }
}

export default Monster;
