import { Vector } from "./Vector";
import { Sprites } from "./Sprites";

export interface CharacterInitializationOptions {
  x: number;
  y: number;
  size: number;
  velocity?: Vector;
  imageSrc?: string;
  sprites?: Sprites;
  health?: number;
}
