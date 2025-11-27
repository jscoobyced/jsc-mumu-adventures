import { Vector } from "./Vector";
import { Sprites } from "./Sprites";

export interface CharacterInitializationOptions {
  x: number;
  y: number;
  size: number;
  imageSrc: string;
  velocity?: Vector;
  sprites?: Sprites;
  health?: number;
}
