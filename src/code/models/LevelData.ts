import { Monster } from "../classes/Monster";
import { LayersData } from "./Layer";
import { Tilesets } from "./TileSet";

export interface LevelData {
  layersData: LayersData;
  frontRenderedLayersData: LayersData;
  tilesets: Tilesets;
  l_Collisions: number[][];
  monsters: Monster[];
}
