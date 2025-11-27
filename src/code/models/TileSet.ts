export interface TilesetInfo {
  imageUrl: string;
  tileSize: number;
}

export interface Tilesets {
  [key: string]: TilesetInfo;
}
