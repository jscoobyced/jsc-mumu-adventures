# Copilot Instructions for JSC's Mumu's Adventures

## Build, Test, and Lint Commands

- **All commands must be run from the `frontend/` directory.**
- **Install dependencies:**
  ```sh
  yarn install
  ```
- **Start development server:**
  ```sh
  yarn dev
  ```
- **Build for production:**
  ```sh
  yarn build
  ```
- **Run linter:**
  ```sh
  yarn lint
  ```
- **Format code:**
  ```sh
  yarn format
  ```
- **Run all tests (Vitest):**
  ```sh
  yarn test
  ```
- **Run tests with coverage:**
  ```sh
  yarn test:coverage
  ```
- **Run a single test file:**
  ```sh
  yarn test path/to/file.test.ts
  ```
- **Generate map data from Tiled .tmj:**
  ```sh
  yarn gen-map <level>/<number>/map.tmj
  ```
- **Split a sprite sheet:**
  ```sh
  yarn split-sprite <path_to_file.png>
  ```
- **Update version and create git tag:**
  ```sh
  yarn full-tag
  ```

## High-Level Architecture

- **TypeScript (strict mode), no runtime dependencies.**
- **Frontend app in `frontend/`**: Entry point is `src/index.ts`.
- **Game loop** in `src/level.ts` uses `requestAnimationFrame` for updates and rendering.
- **Class hierarchy** for game entities:
  - `Character` (abstract)
    - `Player`
    - `SimpleNpc` → `ActiveNpc` → `InteractiveNpc`
- **Tile-based maps**: Defined as 2D arrays, rendered via offscreen canvases for performance.
- **State persistence**: Game state is encrypted and stored in `localStorage` using AES-GCM (see `src/utils/crypto.ts`, `src/utils/storage.ts`).
- **Global state**: `window.jsc` holds app version, debug flag, and current status (see `src/models/ApplicationData.ts`).
- **Level system**: Levels and connections defined in `src/levels/`.
- **Testing**: All test files use Vitest and are named `*.test.ts`, placed alongside source files. Global mocks for Image and canvas context are in `src/test-setup.ts`.
- **CI/CD**: GitHub Actions workflow in `.github/workflows/build.yml` runs install, lint, test, and Docker build on release.

## Key Conventions

- **File naming:**
  - PascalCase for classes (e.g., `Player.ts`), camelCase for utilities (e.g., `game.ts`).
  - One class per file in `src/classes/`, one interface/type/enum per file in `src/models/`.
- **TypeScript:**
  - No `any` types; use explicit interfaces in `src/models/`.
  - Use `interface` for data shapes, `enum` for finite sets, `class` for entities.
  - Barrel exports in `src/models/index.ts`.
- **Prettier:**
  - No semicolons, single quotes, trailing commas, 80 char print width, auto-organize imports.
- **ESLint:**
  - Flat config in `eslint.config.js`, applies only to `.ts` files.
- **Testing:**
  - Use `describe`/`it` from Vitest. Place tests as `*.test.ts` next to source. Use `vi.mock` for dependencies.
  - Coverage exclusions and setup in `vite.config.ts`.
- **Game loop:**
  - Always use `requestAnimationFrame` for updates.
  - Separate update and render logic.
- **Environment variables:**
  - Use `VITE_*` prefix for build-time config.
- **All source code is under `frontend/src/`.**
- **Static assets are in `frontend/public/`.**

---
