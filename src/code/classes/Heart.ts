import { Vector, SpriteConfig } from "../models";
import config from "../config.json";

export class Heart {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public center: Vector;
  public loaded: boolean;
  public image: HTMLImageElement;
  public currentFrame: number;
  public currentSprite: SpriteConfig;

  constructor({ x, y }: Vector) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };

    this.loaded = false;
    this.image = new Image();
    this.image.onload = (): void => {
      this.loaded = true;
    };
    this.image.src = config.images.decorations.heart;
    this.currentFrame = 4;

    this.currentSprite = {
      x: 0,
      y: 0,
      width: 16,
      height: 16,
      frameCount: 4,
    };
  }

  public draw(c: CanvasRenderingContext2D): void {
    if (!this.loaded) return;

    c.drawImage(
      this.image,
      this.currentSprite.x + this.currentSprite.width * this.currentFrame,
      this.currentSprite.y,
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
