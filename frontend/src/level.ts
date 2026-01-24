import { CollisionBlock } from './classes/CollisionBlock'
import { Heart } from './classes/Heart'
import config from './config.json'
import { levelConfig } from './levels'
import { LayersData } from './models/Layer'
import { LevelData, LevelDirection } from './models/LevelData'
import { TilesetInfo, Tilesets } from './models/TileSet'
import { isDebugMode } from './utils/debug'
import { dpr, getDrawContext } from './utils/drawContext'
import { getKeys, getLastTime, setLastTime } from './utils/eventListeners'
import { Game, handleNpcs, startGame } from './utils/game'
import { loadImage } from './utils/loadImage'

const MAP_COLS: number = config.cols
const MAP_ROWS: number = config.rows

const MAP_WIDTH: number = config.tileSize * MAP_COLS
const MAP_HEIGHT: number = config.tileSize * MAP_ROWS
const MAP_SCALE: number = dpr + config.mapScale

const BUFFER = 0.0001

const context = getDrawContext()

if (!context) {
  throw new Error('Failed to get 2D context from canvas')
}

const VIEWPORT_WIDTH: number = context.canvas.width / MAP_SCALE
const VIEWPORT_HEIGHT: number = context.canvas.height / MAP_SCALE

const VIEWPORT_CENTER_X: number = VIEWPORT_WIDTH / 2
const VIEWPORT_CENTER_Y: number = VIEWPORT_HEIGHT / 2

const MAX_SCROLL_X: number = MAP_WIDTH - VIEWPORT_WIDTH
const MAX_SCROLL_Y: number = MAP_HEIGHT - VIEWPORT_HEIGHT

const collisionBlocks: CollisionBlock[] = []

const prepareLevel = (level: LevelData) => {
  collisionBlocks.length = 0
  level.l_Collisions.forEach((row: number[], y: number) => {
    row.forEach((symbol: number, x: number) => {
      if (symbol === 1) {
        collisionBlocks.push(
          new CollisionBlock({
            x: x * config.tileSize,
            y: y * config.tileSize,
            size: config.tileSize,
          }),
        )
      }
    })
  })
}

let frontRenderedCanvas: HTMLCanvasElement

const renderLayer = (
  tilesData: number[][],
  tilesetImage: HTMLImageElement,
  tileSize: number,
  context: CanvasRenderingContext2D,
): void => {
  const tilesPerRow: number = Math.ceil(tilesetImage.width / tileSize)

  tilesData.forEach((row: number[], y: number) => {
    row.forEach((symbol: number, x: number) => {
      if (symbol !== 0) {
        const tileIndex: number = symbol - 1

        const srcX: number = (tileIndex % tilesPerRow) * tileSize
        const srcY: number = Math.floor(tileIndex / tilesPerRow) * tileSize

        context.drawImage(
          tilesetImage,
          srcX,
          srcY,
          tileSize,
          tileSize,
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize,
        )
      }
    })
  })
}

const renderStaticLayers = async (
  layersData: LayersData,
  tilesets: Tilesets,
): Promise<HTMLCanvasElement> => {
  const offscreenCanvas: HTMLCanvasElement = document.createElement('canvas')
  offscreenCanvas.width = MAP_WIDTH
  offscreenCanvas.height = MAP_HEIGHT
  const offscreenContext = offscreenCanvas.getContext(
    '2d',
  ) as CanvasRenderingContext2D

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo: TilesetInfo | undefined = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage: HTMLImageElement = await loadImage(
          tilesetInfo.imageUrl,
        )
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  return offscreenCanvas
}

const animate = (
  backgroundCanvas: HTMLCanvasElement,
  game: Game,
  frontRenderedCanvas: HTMLCanvasElement,
): void => {
  // Calculate delta time
  const currentTime: number = performance.now()
  const deltaTime: number = (currentTime - getLastTime()) / 1000
  setLastTime(currentTime)

  // Update player position
  if (game.playing && !game.paused) game.player.handleInput(getKeys())
  const levelDirection =
    game.playing && !game.paused
      ? game.player.update(deltaTime, collisionBlocks)
      : LevelDirection.NONE

  const horizontalScrollDistance: number = Math.min(
    Math.max(0, game.player.center.x - VIEWPORT_CENTER_X),
    MAX_SCROLL_X,
  )

  const verticalScrollDistance: number = Math.min(
    Math.max(0, game.player.center.y - VIEWPORT_CENTER_Y),
    MAX_SCROLL_Y,
  )

  // Render scene
  context.save()
  context.scale(MAP_SCALE, MAP_SCALE)
  context.translate(-horizontalScrollDistance, -verticalScrollDistance)
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  context.drawImage(backgroundCanvas, 0, 0)
  if (isDebugMode()) {
    debugCollisions(context)
  }
  game.player.draw(context)
  const keys = getKeys()

  if (!game.paused) handleNpcs(game, context, collisionBlocks, deltaTime, keys)

  context.drawImage(frontRenderedCanvas, 0, 0)
  context.restore()

  context.save()
  context.scale(MAP_SCALE, MAP_SCALE)
  game.hearts.forEach((heart: Heart) => {
    heart.draw(context)
  })
  context.restore()

  const bannerClosed = game.banner.draw(context, keys)
  if (game.paused && bannerClosed) {
    game.paused = false
  }

  // Check if restart game
  if (!game.playing && bannerClosed) {
    startGame(true)
    return
  }

  // Check if change level
  if (levelDirection !== LevelDirection.NONE) {
    const currentConfig = levelConfig.find(
      (config) => config.level.name === game.levelData.name,
    )
    if (currentConfig) {
      const connection = currentConfig.connectedLevels?.find(
        (conn) => conn.direction === levelDirection,
      )
      if (connection) {
        if (levelDirection === LevelDirection.LEFT) {
          game.player.position.x = MAP_WIDTH - game.player.width - BUFFER
        } else if (levelDirection === LevelDirection.RIGHT) {
          game.player.position.x = 0 + BUFFER
        } else if (levelDirection === LevelDirection.UP) {
          game.player.position.y = MAP_HEIGHT - game.player.height - BUFFER
        } else if (levelDirection === LevelDirection.DOWN) {
          game.player.position.y = 0 + BUFFER
        }
        game.levelData = connection.level
        startRendering(game)
        return
      }
    }
  }

  requestAnimationFrame(() =>
    animate(backgroundCanvas, game, frontRenderedCanvas),
  )
}

const debugCollisions = (c: CanvasRenderingContext2D): void => {
  collisionBlocks.forEach((block: CollisionBlock) => {
    block.draw(c)
  })
}

export const startRendering = async (game: Game): Promise<void> => {
  prepareLevel(game.levelData)
  try {
    const backgroundCanvas: HTMLCanvasElement = await renderStaticLayers(
      game.levelData.layersData,
      game.levelData.tilesets,
    )
    frontRenderedCanvas = await renderStaticLayers(
      game.levelData.frontRenderedLayersData,
      game.levelData.tilesets,
    )
    if (!backgroundCanvas) {
      console.error('Failed to create the background canvas')
      return
    }
    animate(backgroundCanvas, game, frontRenderedCanvas)
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}
