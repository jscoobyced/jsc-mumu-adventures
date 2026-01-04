import { Heart } from "../classes/Heart";
import { Player } from "../classes/Player";
import { startRendering } from "../level";
import { levelData as initialLevel } from "../levels/A/1/index";
import config from "../config.json";
import { LevelData } from "../models/LevelData";
import { Banner } from "../classes/Banner";

export interface Game {
  playing: boolean;
  levelData: LevelData;
  player: Player;
  hearts: Heart[];
  banner: Banner;
}

export const startGame = (): void => {
  const initialHearts: Heart[] = [
    new Heart({
      x: 10,
      y: 10,
    }),
    new Heart({
      x: 32,
      y: 10,
    }),
    new Heart({
      x: 54,
      y: 10,
    }),
  ];

  const initialPlayer: Player = new Player({
    x: 200,
    y: 550,
    size: 15,
    imageSrc: config.images.player.princess,
  });
  const game = {
    playing: true,
    levelData: initialLevel,
    player: initialPlayer,
    hearts: initialHearts,
    banner: new Banner({ x: 10, y: 10 }),
  };
  startRendering(game);
};
