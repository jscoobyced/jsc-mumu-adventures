import { CollisionBlock } from "./classes/CollisionBlock";
import { Heart } from "./classes/Heart";
import { Monster } from "./classes/Monster";
import Player from "./classes/Player";
import { LayersData } from "./models/Layer";
import { LevelData, LevelDirection } from "./models/LevelData";
import { TilesetInfo, Tilesets } from "./models/TileSet";
import { getKeys, getLastTime, setLastTime } from "./utils/eventListeners";
import { loadImage } from "./utils/loadImage";
import config from "./config.json";
import { mapConfig } from "./levels";

const dpr: number = Math.max(1, window.devicePixelRatio);

const MAP_COLS: number = config.cols;
const MAP_ROWS: number = config.rows;

const MAP_WIDTH: number = config.tileSize * MAP_COLS;
const MAP_HEIGHT: number = config.tileSize * MAP_ROWS;
const MAP_SCALE: number = dpr + config.mapScale;

const BUFFER = 0.0001;

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const c = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = config.canvasWidth * dpr;
canvas.height = config.canvasHeight * dpr;

const VIEWPORT_WIDTH: number = canvas.width / MAP_SCALE;
const VIEWPORT_HEIGHT: number = canvas.height / MAP_SCALE;

const VIEWPORT_CENTER_X: number = VIEWPORT_WIDTH / 2;
const VIEWPORT_CENTER_Y: number = VIEWPORT_HEIGHT / 2;

const MAX_SCROLL_X: number = MAP_WIDTH - VIEWPORT_WIDTH;
const MAX_SCROLL_Y: number = MAP_HEIGHT - VIEWPORT_HEIGHT;

const collisionBlocks: CollisionBlock[] = [];

const prepareLevel = (level: LevelData) => {
  collisionBlocks.length = 0;
  level.l_Collisions.forEach((row: number[], y: number) => {
    row.forEach((symbol: number, x: number) => {
      if (symbol === 1) {
        collisionBlocks.push(
          new CollisionBlock({
            x: x * config.tileSize,
            y: y * config.tileSize,
            size: config.tileSize,
          })
        );
      }
    });
  });
};

let frontRenderedCanvas: HTMLCanvasElement;

const renderLayer = (
  tilesData: number[][],
  tilesetImage: HTMLImageElement,
  tileSize: number,
  context: CanvasRenderingContext2D
): void => {
  const tilesPerRow: number = Math.ceil(tilesetImage.width / tileSize);

  tilesData.forEach((row: number[], y: number) => {
    row.forEach((symbol: number, x: number) => {
      if (symbol !== 0) {
        const tileIndex: number = symbol - 1;

        const srcX: number = (tileIndex % tilesPerRow) * tileSize;
        const srcY: number = Math.floor(tileIndex / tilesPerRow) * tileSize;

        context.drawImage(
          tilesetImage,
          srcX,
          srcY,
          tileSize,
          tileSize,
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize
        );
      }
    });
  });
};

const renderStaticLayers = async (
  layersData: LayersData,
  tilesets: Tilesets
): Promise<HTMLCanvasElement> => {
  const offscreenCanvas: HTMLCanvasElement = document.createElement("canvas");
  offscreenCanvas.width = MAP_WIDTH;
  offscreenCanvas.height = MAP_HEIGHT;
  const offscreenContext = offscreenCanvas.getContext(
    "2d"
  ) as CanvasRenderingContext2D;

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo: TilesetInfo | undefined = tilesets[layerName];
    if (tilesetInfo) {
      try {
        const tilesetImage: HTMLImageElement = await loadImage(
          tilesetInfo.imageUrl
        );
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext
        );
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error);
      }
    }
  }

  return offscreenCanvas;
};

const animate = (
  backgroundCanvas: HTMLCanvasElement,
  player: Player,
  levelData: LevelData,
  hearts: Heart[],
  frontRenderedCanvas: HTMLCanvasElement
): void => {
  // Calculate delta time
  const currentTime: number = performance.now();
  const deltaTime: number = (currentTime - getLastTime()) / 1000;
  setLastTime(currentTime);

  // Update player position
  player.handleInput(getKeys());
  const levelDirection = player.update(deltaTime, collisionBlocks);

  const horizontalScrollDistance: number = Math.min(
    Math.max(0, player.center.x - VIEWPORT_CENTER_X),
    MAX_SCROLL_X
  );

  const verticalScrollDistance: number = Math.min(
    Math.max(0, player.center.y - VIEWPORT_CENTER_Y),
    MAX_SCROLL_Y
  );

  // Render scene
  c.save();
  c.scale(MAP_SCALE, MAP_SCALE);
  c.translate(-horizontalScrollDistance, -verticalScrollDistance);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.drawImage(backgroundCanvas, 0, 0);
  player.draw(c);

  // render out our monsters
  if (!levelData.monsters) {
    levelData.monsters = [];
  }
  for (let i = levelData.monsters.length - 1; i >= 0; i--) {
    const monster: Monster = levelData.monsters[i];
    monster.update(deltaTime, collisionBlocks);
    monster.draw(c);

    // Detect for collision
    if (
      player.x + player.width >= monster.x &&
      player.x <= monster.x + monster.width &&
      player.y + player.height >= monster.y &&
      player.y <= monster.y + monster.height &&
      !player.isInvincible
    ) {
      player.receiveHit();
      const filledHearts: Heart[] = hearts.filter(
        (heart: Heart) => heart.currentFrame === 4
      );

      if (filledHearts.length > 0) {
        filledHearts[filledHearts.length - 1].currentFrame = 0;
      }

      if (filledHearts.length <= 1) {
        console.log("game over");
      }
    }
  }

  c.drawImage(frontRenderedCanvas, 0, 0);
  c.restore();

  c.save();
  c.scale(MAP_SCALE, MAP_SCALE);
  hearts.forEach((heart: Heart) => {
    heart.draw(c);
  });
  c.restore();

  // Check if change level
  if (levelDirection !== LevelDirection.NONE) {
    console.log("Level change detected:", levelDirection);
    const currentConfig = mapConfig.find(
      (config) => config.levelName === levelData.name
    );
    if (currentConfig) {
      const connection = currentConfig.connectedLevels?.find(
        (conn) => conn.direction === levelDirection
      );
      if (connection) {
        if (levelDirection === LevelDirection.LEFT) {
          player.x = MAP_WIDTH - player.width - BUFFER;
        } else if (levelDirection === LevelDirection.RIGHT) {
          player.x = 0 + BUFFER;
        } else if (levelDirection === LevelDirection.UP) {
          player.y = MAP_HEIGHT - player.height - BUFFER;
        } else if (levelDirection === LevelDirection.DOWN) {
          player.y = 0 + BUFFER;
        }
        const newLevelData = connection.level;
        startRendering(newLevelData, player, hearts);
        return;
      }
    }
  }

  requestAnimationFrame(() =>
    animate(backgroundCanvas, player, levelData, hearts, frontRenderedCanvas)
  );
};

export const startRendering = async (
  levelData: LevelData,
  player: Player,
  hearts: Heart[]
): Promise<void> => {
  prepareLevel(levelData);
  try {
    const backgroundCanvas: HTMLCanvasElement = await renderStaticLayers(
      levelData.layersData,
      levelData.tilesets
    );
    frontRenderedCanvas = await renderStaticLayers(
      levelData.frontRenderedLayersData,
      levelData.tilesets
    );
    if (!backgroundCanvas) {
      console.error("Failed to create the background canvas");
      return;
    }

    animate(backgroundCanvas, player, levelData, hearts, frontRenderedCanvas);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
};
