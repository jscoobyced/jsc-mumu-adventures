import { CharacterInitializationOptions, Sprites, Keys } from "../models";
import { CollisionBlock } from "./CollisionBlock";
import { Character } from "./Character";

const X_VELOCITY = 150;
const Y_VELOCITY = 150;

export class Player extends Character {
  public sprites: Sprites;

  constructor({
    x,
    y,
    size,
    velocity = { x: 0, y: 0 },
  }: CharacterInitializationOptions) {
    super(x, y, size, velocity);

    this.invincibilityInterval = 0.8;
    this.loadImage("./images/princess.png");

    this.sprites = {
      walkDown: {
        x: 0,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkUp: {
        x: 16,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkLeft: {
        x: 32,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkRight: {
        x: 48,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
    };

    this.currentSprite = this.sprites.walkDown;
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

  public update(deltaTime: number, collisionBlocks: CollisionBlock[]): void {
    if (!deltaTime) return;

    this.updateInvincibility(deltaTime);
    this.updateAnimation(deltaTime);
    this.updatePosition(deltaTime, collisionBlocks);
  }

  public handleInput(keys: Keys): void {
    this.velocity.x = 0;
    this.velocity.y = 0;
    if (!this.currentSprite) return;
    this.currentSprite.frameCount = 4;

    if (keys.d.pressed) {
      this.currentSprite = this.sprites.walkRight;
      this.velocity.x = X_VELOCITY;
    } else if (keys.a.pressed) {
      this.currentSprite = this.sprites.walkLeft;
      this.velocity.x = -X_VELOCITY;
    } else if (keys.w.pressed) {
      this.currentSprite = this.sprites.walkUp;
      this.velocity.y = -Y_VELOCITY;
    } else if (keys.s.pressed) {
      this.currentSprite = this.sprites.walkDown;
      this.velocity.y = Y_VELOCITY;
    } else {
      this.currentSprite.frameCount = 1;
    }
  }

  protected onVerticalCollision(): void {
    this.velocity.y = 0;
  }
}

export default Player;
