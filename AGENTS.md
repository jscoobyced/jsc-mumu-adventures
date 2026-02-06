# AGENTS.md

## Project Overview

**JSC's Mumu's Adventures** is a 2D top-down adventure game (Legend of Zelda style) built entirely in **TypeScript** with **zero runtime dependencies**. It renders on an HTML5 Canvas using a custom game loop, tile-based map rendering, sprite animation, collision detection, and NPC interaction system. The game is bundled with **Vite** and deployed as a static site via **Nginx** in a Docker container.

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Language     | TypeScript 5.x (strict mode)     |
| Bundler      | Vite 7.x                         |
| Test Runner  | Vitest 4.x (with v8 coverage)    |
| Linter       | ESLint 9.x + typescript-eslint   |
| Formatter    | Prettier (no semi, single quotes)|
| Package Mgr  | Yarn (classic)                   |
| CI/CD        | GitHub Actions                   |
| Deployment   | Docker (Nginx Alpine)            |
| Node Version | 24                               |

## Repository Structure

```
├── AGENTS.md
├── README.md
├── LICENSE.txt
├── assets/                        # Raw/source assets
├── docs/                          # Documentation and images
├── etc/
│   └── docker/
│       ├── Dockerfile             # Multi-stage build (Node → Nginx)
│       └── nginx.conf
├── .github/
│   └── workflows/
│       └── build.yml              # CI: install → lint → test → build Docker image
└── frontend/                      # Application root
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── eslint.config.js
    ├── .prettierrc
    ├── index.html                 # Entry HTML with Canvas element
    ├── public/                    # Static assets (images, fonts, audio, CSS)
    ├── scripts/                   # Shell scripts for versioning/tagging
    └── src/
        ├── index.ts               # Application entry point
        ├── config.json            # Game configuration (tile size, canvas, image paths)
        ├── level.ts               # Map rendering and game loop (animate)
        ├── sprites.ts             # Character sprite definitions
        ├── intro/                 # Intro/title screen
        │   └── index.ts
        ├── levels/                # Level data and connections
        │   ├── index.ts           # Level config and connections between levels
        │   └── A/                 # Level group A (subdirectories per level)
        ├── classes/               # Game entity classes
        │   ├── Character.ts       # Abstract base class for all characters
        │   ├── Player.ts          # Player character (extends Character)
        │   ├── SimpleNpc.ts       # Basic wandering NPC (extends Character)
        │   ├── ActiveNpc.ts       # NPC that can attack (extends SimpleNpc)
        │   ├── InteractiveNpc.ts  # NPC with dialogue/objects (extends ActiveNpc)
        │   ├── CollisionBlock.ts  # Tile-based collision block
        │   ├── Heart.ts           # Health UI heart sprite
        │   └── Banner.ts         # Dialog/message banner overlay
        ├── models/                # TypeScript interfaces and types
        │   ├── index.ts           # Barrel exports
        │   ├── ApplicationData.ts # Global app state (window.jsc)
        │   ├── CharacterInitializationOptions.ts
        │   ├── CurrentStatusData.ts # Save/load data structures
        │   ├── Interaction.ts     # NPC interaction state enum
        │   ├── Keys.ts            # Keyboard input state
        │   ├── Layer.ts           # Map layer data
        │   ├── LevelData.ts       # Level, config, and direction types
        │   ├── NpcConfiguration.ts
        │   ├── NpcSprites.ts
        │   ├── SpriteConfig.ts
        │   ├── Sprites.ts
        │   ├── TileSet.ts
        │   └── Vector.ts          # 2D vector { x, y }
        └── utils/                 # Utility modules
            ├── game.ts            # Game initialization and NPC handling
            ├── eventListeners.ts  # Keyboard event handling
            ├── drawContext.ts     # Canvas 2D context setup
            ├── loadImage.ts       # Async image loader with cache
            ├── music.ts           # Background audio management
            ├── npc.ts             # NPC factory from configuration
            ├── storage.ts         # Encrypted localStorage save/load
            ├── crypto.ts          # AES-GCM encryption via Web Crypto API
            ├── window.ts          # Global window.jsc accessor
            ├── debug.ts           # Debug mode flag
            ├── log.ts             # Conditional debug logger
            ├── generate-map-data.ts  # CLI tool: convert Tiled .tmj → TS
            └── split-sprites.ts   # CLI tool: split sprite sheets
```

## Architecture & Key Patterns

### Game Loop
The game uses `requestAnimationFrame` for a standard game loop in `level.ts`:
1. Calculate delta time from `performance.now()`
2. Handle player input → update player position/collisions
3. Render background tilemap (offscreen canvas) → draw player → handle NPCs → draw front layers
4. Draw HUD (hearts) and dialog banner
5. Check for level transitions or game over

### Class Hierarchy
```
Character (abstract)
├── Player          — handles WASD/arrow input, inventory, collision with map edges triggers level changes
└── SimpleNpc       — random wandering AI within a radius
    └── ActiveNpc   — adds attacking capability and invincibility
        └── InteractiveNpc — adds dialogue, object exchange, portrait, interaction state machine
```

### Tile-Based Rendering
- Maps are defined as 2D number arrays (from Tiled editor .tmj exports)
- Layers are rendered to offscreen `<canvas>` elements for performance
- Background and front-rendered layers are separated for proper z-ordering

### State Persistence
- Game state (health, position, inventory, NPC interaction state) is saved to `localStorage`
- Data is encrypted with **AES-GCM** using the Web Crypto API
- Crypto key and IV are also stored in localStorage

### Global State
- `window.jsc` (`ApplicationData`) holds app version, debug flag, current status data, and crypto key
- Accessed via `getJscData()` utility

### Level System
- Levels are defined in `src/levels/` with a config array linking levels by direction
- Walking off a map edge triggers a level transition to the connected level

## Commands

All commands must be run from the `frontend/` directory:

| Command                    | Description                                  |
| -------------------------- | -------------------------------------------- |
| `yarn install`             | Install dependencies                         |
| `yarn dev`                 | Start Vite dev server                        |
| `yarn build`               | TypeScript compile + Vite production build   |
| `yarn lint`                | Run ESLint                                   |
| `yarn test`                | Run Vitest in watch mode                     |
| `yarn test:coverage`       | Run Vitest with v8 coverage                  |
| `yarn format`              | Format code with Prettier                    |
| `yarn gen-map`             | Convert Tiled .tmj map to TypeScript arrays  |
| `yarn split-sprite`        | Split a sprite sheet into individual files   |
| `yarn update-version`      | Bump version in package.json                 |
| `yarn create-tag`          | Create a git tag from current version        |
| `yarn full-tag`            | Update version + create tag                  |

## Code Style & Conventions

### TypeScript
- **Strict mode** is enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports`
- Target: **ES2023**, Module: **ESNext**, Module Resolution: **Bundler**
- No `any` types — prefer explicit interfaces defined in `src/models/`
- Use `interface` for data shapes, `enum` for finite sets of values, and `class` for stateful game entities
- Barrel exports in `src/models/index.ts` for commonly used types

### Prettier
- No semicolons
- Single quotes
- Trailing commas (all)
- 80 character print width
- Auto-organize imports via `prettier-plugin-organize-imports`

### ESLint
- Uses flat config (`eslint.config.js`)
- Extends `@eslint/js` recommended + `typescript-eslint` recommended
- Only applies to `.ts` files

### Naming Conventions
- **Files**: PascalCase for classes (`Player.ts`, `CollisionBlock.ts`), camelCase for utilities/modules (`game.ts`, `loadImage.ts`)
- **Classes**: PascalCase (`Player`, `InteractiveNpc`, `CollisionBlock`)
- **Interfaces**: PascalCase, no `I` prefix (`CharacterInitializationOptions`, `Keys`, `Vector`)
- **Enums**: PascalCase name, UPPER_CASE values (`LevelDirection.RIGHT`, `Interaction.NONE`)
- **Constants**: UPPER_SNAKE_CASE for module-level constants (`X_VELOCITY`, `MAP_WIDTH`)
- **Functions/variables**: camelCase (`startGame`, `handleNpcs`, `collisionBlocks`)

### File Organization
- One class per file in `src/classes/`
- One interface/type/enum per file in `src/models/`
- Utility functions grouped by concern in `src/utils/`
- Level data organized by group/number in `src/levels/`

## Best Practices

### TypeScript & JavaScript
- Always provide explicit type annotations for function parameters and return types
- Use `readonly` and `const` wherever values should not be reassigned
- Prefer `interface` over `type` for object shapes (they are extensible and produce clearer error messages)
- Use `enum` sparingly — only for well-defined finite state sets (like `Interaction`, `LevelDirection`)
- Avoid `as` type assertions; use type guards or proper typing instead
- Never use `any` — use `unknown` and narrow with type checks if the type is truly unknown
- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of manual null checks
- Prefer `for...of` or array methods (`.map`, `.filter`, `.find`) over index-based loops when possible
- Keep functions small and single-purpose
- Use `Promise`-based async patterns, never callbacks

### Testing
- **Test files location**: Place test files alongside source files with `.test.ts` extension (e.g., `Player.ts` → `Player.test.ts`)
- **Testing framework**: Use Vitest for unit tests (configured in `vite.config.ts`)
- **Coverage requirements**: Aim for **≥95% line coverage** and **≥90% branch coverage** for all classes
- **Test structure**: Use `describe()` for grouping related tests, `it()` for individual test cases
- **Mocking**: Mock external dependencies (image loading, localStorage, canvas context) using `vi.fn()` and `vi.mock()`
- **Test naming**: Use descriptive test names that clearly state what is being tested (e.g., "should create player with default inventory")
- **Async testing**: Use `async/await` for testing asynchronous operations like image loading
- **Test isolation**: Each test should be independent; use `beforeEach()` to reset state and clear mocks
- **Coverage exclusions**: Exclude CLI tools, test files, and setup files from coverage (see `vite.config.ts`)
- **Running tests**:
  - `yarn test` — Run tests in watch mode
  - `yarn test:coverage` — Run tests with coverage report
  - `yarn test:coverage --run` — Run tests once with coverage
- **Mock setup**: Global mocks for Image, HTMLImageElement, and canvas context are in `src/test-setup.ts`
- **Test patterns**:
  - Test all public methods and properties
  - Test edge cases (empty inputs, null/undefined, boundary values)
  - Test error handling and validation
  - Test state changes and side effects
  - Test collision detection and boundary conditions
  - Test inheritance and polymorphic behavior

### Canvas & Game Development
- Use offscreen canvases for static layer rendering to avoid redundant draw calls
- Always use `requestAnimationFrame` for the game loop — never `setInterval`/`setTimeout`
- Compute delta time from `performance.now()` for frame-rate independent movement
- Cache loaded images (see `loadImage.ts`) to avoid redundant network requests
- Use `context.save()` / `context.restore()` around transformations to avoid state leaks
- Separate update logic from render logic in the game loop
- Use tile-based collision detection for grid-aligned maps

### Code Quality
- No runtime dependencies — the game runs on vanilla TypeScript and browser APIs only
- Run `yarn lint` and `yarn format` before committing
- Run `yarn build` to verify TypeScript compilation passes (strict checks)
- Tests go in files matching `*.test.ts` pattern alongside or near source files, run with Vitest
- Keep configuration in `src/config.json` — avoid hardcoding paths, sizes, or asset URLs in code
- Use environment variables (`VITE_*` prefix) for deployment-specific configuration

### Project Conventions
- All source code lives under `frontend/src/`
- Static assets (images, fonts, audio, CSS) go in `frontend/public/`
- Docker build context is the repository root; the Dockerfile is at `etc/docker/Dockerfile`
- CI pipeline runs on GitHub Actions: install → lint → test → build Docker image (on release)
- Version management is done via `yarn update-version` and `yarn create-tag` scripts

## Environment Variables

Environment variables use the `VITE_` prefix and are injected at build time via Vite:

| Variable                 | Description                          |
| ------------------------ | ------------------------------------ |
| `VITE_APP_NAME`          | Application display name             |
| `VITE_APP_VERSION`       | Current version string               |
| `VITE_FACEBOOK_APP_ID`   | Facebook Open Graph app ID           |
| `VITE_DESCRIPTION`       | App description for meta tags        |
| `VITE_APP_URL`           | Production URL                       |
| `VITE_APP_IMAGE`         | Open Graph image URL                 |
| `VITE_APP_IMAGE_HEIGHT`  | Open Graph image height              |
| `VITE_APP_IMAGE_WIDTH`   | Open Graph image width               |

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/build.yml`) triggers on **release published**:

1. **Install** — `yarn install`, upload `node_modules` as artifact
2. **Lint** — `yarn lint` with ESLint
3. **Test** — `yarn test:coverage` (only if `*.test.ts` files exist), upload coverage to Codecov
4. **Build & Push** — Docker multi-stage build, push to Docker Hub (only for non-prerelease tags matching `v*`)
