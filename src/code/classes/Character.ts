import { Vector, SpriteConfig } from "../models";
import { CollisionBlock } from "./CollisionBlock";
import config from "../config.json";
const MAP_WIDTH: number = config.tileSize * config.cols;
const MAP_HEIGHT: number = config.tileSize * config.rows;

const BUFFER = 0.0001;

export abstract class Character {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public velocity: Vector;
  public center: Vector;
  public image: HTMLImageElement;
  public imageLoaded: boolean;
  public currentFrame: number;
  public elapsedTime: number;
  public currentSprite?: SpriteConfig;
  public isInvincible: boolean;
  public elapsedInvincibilityTime: number;
  public invincibilityInterval?: number;

  constructor(
    x: number,
    y: number,
    size: number,
    velocity: Vector = { x: 0, y: 0 }
  ) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.velocity = velocity;
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };

    this.image = new Image();
    this.imageLoaded = false;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.isInvincible = false;
    this.elapsedInvincibilityTime = 0;
  }

  protected loadImage(imageSrc: string): void {
    this.image.onload = (): void => {
      this.imageLoaded = true;
    };
    this.image.src = imageSrc;
  }

  public receiveHit(): void {
    if (this.isInvincible) return;
    this.isInvincible = true;
  }

  protected updateAnimation(
    deltaTime: number,
    frameDuration: number = 0.15
  ): void {
    this.elapsedTime += deltaTime;

    if (this.currentSprite !== undefined && this.elapsedTime > frameDuration) {
      this.currentFrame =
        (this.currentFrame + 1) % this.currentSprite.frameCount;
      this.elapsedTime -= frameDuration;
    }
  }

  protected updateInvincibility(deltaTime: number): void {
    if (this.isInvincible) {
      this.elapsedInvincibilityTime += deltaTime;

      if (
        this.invincibilityInterval !== undefined &&
        this.elapsedInvincibilityTime >= this.invincibilityInterval
      ) {
        this.isInvincible = false;
        this.elapsedInvincibilityTime = 0;
      }
    }
  }

  protected updatePosition(
    deltaTime: number,
    collisionBlocks: CollisionBlock[]
  ): void {
    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime);
    this.checkForHorizontalCollisions(collisionBlocks);
    this.checkHorizontalMapCollision();

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime);
    this.checkForVerticalCollisions(collisionBlocks);
    this.checkVerticalMapCollision();

    this.updateCenter();
  }

  protected updateHorizontalPosition(deltaTime: number): void {
    this.x += this.velocity.x * deltaTime;
  }

  protected updateVerticalPosition(deltaTime: number): void {
    this.y += this.velocity.y * deltaTime;
  }

  protected updateCenter(): void {
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  protected checkForHorizontalCollisions(
    collisionBlocks: CollisionBlock[]
  ): void {
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        if (this.velocity.x < 0) {
          this.x = collisionBlock.x + collisionBlock.width + BUFFER;
          this.onHorizontalCollision();
          break;
        }

        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - BUFFER;
          this.onHorizontalCollision();
          break;
        }
      }
    }
  }

  protected checkForVerticalCollisions(
    collisionBlocks: CollisionBlock[]
  ): void {
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        if (this.velocity.y < 0) {
          this.y = collisionBlock.y + collisionBlock.height + BUFFER;
          this.onVerticalCollision();
          break;
        }

        if (this.velocity.y > 0) {
          this.y = collisionBlock.y - this.height - BUFFER;
          this.onVerticalCollision();
          break;
        }
      }
    }
  }

  protected checkHorizontalMapCollision(): void {
    if (this.x <= 0) {
      this.x = 0 + BUFFER;
      this.velocity.x = 0;
    }
    if (this.x + this.width >= MAP_WIDTH) {
      this.x = MAP_WIDTH - this.width - BUFFER;
      this.velocity.x = 0;
    }
  }

  protected checkVerticalMapCollision(): void {
    if (this.y <= 0) {
      this.y = 0 + BUFFER;
      this.velocity.y = 0;
    }
    if (this.y + this.height >= MAP_HEIGHT) {
      this.y = MAP_HEIGHT - this.height - BUFFER;
      this.velocity.y = 0;
    }
  }

  // Abstract methods that must be implemented by subclasses
  public abstract draw(c: CanvasRenderingContext2D): void;
  public abstract update(
    deltaTime: number,
    collisionBlocks: CollisionBlock[]
  ): void;

  // Hook methods that can be overridden by subclasses
  protected onHorizontalCollision(): void {
    // Default behavior: do nothing
  }

  protected onVerticalCollision(): void {
    // Default behavior: do nothing
  }
}
