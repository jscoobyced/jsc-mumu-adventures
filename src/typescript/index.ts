import { Sprites } from "./models/Sprites";
import { TilesetInfo, Tilesets } from "./models/TileSet";
import { LayersData } from "./models/Layer";
import { l_Terrain, l_Trees, l_FrontRender, l_Collisions } from "./data";
import { Player } from "./classes/Player";
import { Monster } from "./classes/Monster";
import { CollisionBlock } from "./classes/CollisionBlock";
import { loadImage } from "./utils/loadImage";
import { Heart } from "./classes/Heart";
import {
  getLastTime,
  setLastTime,
  getKeys,
  initializeEventListeners,
} from "./utils/eventListeners";

// Canvas setup
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const c = canvas.getContext("2d") as CanvasRenderingContext2D;
const dpr: number = Math.max(1, window.devicePixelRatio);

canvas.width = 1024 * dpr;
canvas.height = 576 * dpr;
const MAP_SCALE: number = dpr + 0.5;

const MAP_COLS: number = 50;
const MAP_ROWS: number = 50;

const MAP_WIDTH: number = 16 * MAP_COLS;
const MAP_HEIGHT: number = 16 * MAP_ROWS;

const VIEWPORT_WIDTH: number = canvas.width / MAP_SCALE;
const VIEWPORT_HEIGHT: number = canvas.height / MAP_SCALE;

const VIEWPORT_CENTER_X: number = VIEWPORT_WIDTH / 2;
const VIEWPORT_CENTER_Y: number = VIEWPORT_HEIGHT / 2;

const MAX_SCROLL_X: number = MAP_WIDTH - VIEWPORT_WIDTH;
const MAX_SCROLL_Y: number = MAP_HEIGHT - VIEWPORT_HEIGHT;

const layersData: LayersData = {
  l_Terrain: l_Terrain,
  l_Trees: l_Trees,
};

const frontRenderedLayersData: LayersData = {
  l_FrontRender: l_FrontRender,
};

const tilesets: Tilesets = {
  l_Terrain: { imageUrl: "./images/terrain.png", tileSize: 16 },
  l_Trees: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_FrontRender: { imageUrl: "./images/decorations.png", tileSize: 16 },
};

// Tile setup
const collisionBlocks: CollisionBlock[] = [];
const blockSize: number = 16; // Assuming each tile is 16x16 pixels

l_Collisions.forEach((row: number[], y: number) => {
  row.forEach((symbol: number, x: number) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        })
      );
    }
  });
});

const renderLayer = (
  tilesData: number[][],
  tilesetImage: HTMLImageElement,
  tileSize: number,
  context: CanvasRenderingContext2D
): void => {
  // Calculate the number of tiles per row in the tileset
  // We use Math.ceil to ensure we get a whole number of tiles
  const tilesPerRow: number = Math.ceil(tilesetImage.width / tileSize);

  tilesData.forEach((row: number[], y: number) => {
    row.forEach((symbol: number, x: number) => {
      if (symbol !== 0) {
        // Adjust index to be 0-based for calculations
        const tileIndex: number = symbol - 1;

        // Calculate source coordinates
        const srcX: number = (tileIndex % tilesPerRow) * tileSize;
        const srcY: number = Math.floor(tileIndex / tilesPerRow) * tileSize;

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16 // destination width, height
        );
      }
    });
  });
};

const renderStaticLayers = async (
  layersData: LayersData
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

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));

  return offscreenCanvas;
};
// END - Tile setup

// Change xy coordinates to move player's default position
const player: Player = new Player({
  x: 100,
  y: 400,
  size: 15,
});

const monsterSprites: Sprites = {
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

const monsters: Monster[] = [
  new Monster({
    x: 380,
    y: 480,
    size: 15,
    velocity: { x: 0, y: 0 },
    imageSrc: "./images/owl.png",
    sprites: monsterSprites,
  }),
];

let frontRenderedCanvas: HTMLCanvasElement;

const hearts: Heart[] = [
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

function animate(backgroundCanvas: HTMLCanvasElement): void {
  // Calculate delta time
  const currentTime: number = performance.now();
  const deltaTime: number = (currentTime - getLastTime()) / 1000;
  setLastTime(currentTime);

  // Update player position
  player.handleInput(getKeys());
  player.update(deltaTime, collisionBlocks);

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
  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster: Monster = monsters[i];
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

  requestAnimationFrame(() => animate(backgroundCanvas));
}

const startRendering = async (): Promise<void> => {
  try {
    const backgroundCanvas: HTMLCanvasElement = await renderStaticLayers(
      layersData
    );
    frontRenderedCanvas = await renderStaticLayers(frontRenderedLayersData);
    if (!backgroundCanvas) {
      console.error("Failed to create the background canvas");
      return;
    }

    animate(backgroundCanvas);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
};

initializeEventListeners();
startRendering();
