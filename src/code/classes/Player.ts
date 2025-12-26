import { CharacterInitializationOptions, Keys } from "../models";
import { CollisionBlock } from "./CollisionBlock";
import { Character } from "./Character";
import { characterSprites } from "../sprites";
import { LevelDirection } from "../models/LevelData";

const X_VELOCITY = 150;
const Y_VELOCITY = 150;

export class Player extends Character {
  constructor({
    x,
    y,
    size,
    imageSrc,
    velocity = { x: 0, y: 0 },
  }: CharacterInitializationOptions) {
    super(x, y, size, velocity);

    this.invincibilityInterval = 0.8;
    this.loadImage(imageSrc);

    this.currentSprite = characterSprites.walkDown;
  }

  public draw(c: CanvasRenderingContext2D): void {
    if (!this.imageLoaded) return;
    if (!this.currentSprite) return;
    c.drawImage(
      this.image,
      this.currentSprite.x,
      this.currentSprite.height * this.currentFrame,
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  public update(
    deltaTime: number,
    collisionBlocks: CollisionBlock[]
  ): LevelDirection {
    if (!deltaTime) return LevelDirection.NONE;

    this.updateInvincibility(deltaTime);
    this.updateAnimation(deltaTime);
    return this.updatePosition(deltaTime, collisionBlocks);
  }

  public handleInput(keys: Keys): void {
    this.velocity.x = 0;
    this.velocity.y = 0;
    if (!this.currentSprite) return;
    this.currentSprite.frameCount = 4;

    if (keys.d.pressed) {
      this.currentSprite = characterSprites.walkRight;
      this.velocity.x = X_VELOCITY;
    } else if (keys.a.pressed) {
      this.currentSprite = characterSprites.walkLeft;
      this.velocity.x = -X_VELOCITY;
    } else if (keys.w.pressed) {
      this.currentSprite = characterSprites.walkUp;
      this.velocity.y = -Y_VELOCITY;
    } else if (keys.s.pressed) {
      this.currentSprite = characterSprites.walkDown;
      this.velocity.y = Y_VELOCITY;
    } else {
      this.currentSprite.frameCount = 1;
    }
  }
}

export default Player;
