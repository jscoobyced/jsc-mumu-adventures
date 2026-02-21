# Copilot Instructions for JSC's Mumu's Adventures

**Important**: Use `yarn` exclusively. Never use `npm` commands.

## Build, Test, and Lint Commands

All commands must be run from the `frontend/` directory.

```sh
yarn install              # Install dependencies
yarn dev                  # Start dev server
yarn build                # TypeScript check + Vite production build
yarn lint                 # ESLint
yarn format               # Prettier
yarn test                 # Run all tests (Vitest, watch mode)
yarn test path/to/file.test.ts  # Run a single test file
yarn test:coverage        # Tests with coverage report
yarn gen-map <level>/<number>/map.tmj   # Generate map data from Tiled
yarn split-sprite <path_to_file.png>    # Split sprite sheet
```

## High-Level Architecture

- **TypeScript (strict mode), zero runtime dependencies.** All dev tooling only.
- **Entry point**: `src/index.ts` → initializes crypto, loads fonts, then calls `intro()`.
- **Game loop**: `src/level.ts` — `requestAnimationFrame`-based loop with separate update and render phases.
- **Class hierarchy** for game entities:
  - `Character` (abstract) → `Player`
  - `Character` → `SimpleNpc` → `ActiveNpc` → `InteractiveNpc`
- **Central config**: `src/config.json` defines tile size, canvas dimensions, map grid, and all asset paths. Reference this instead of hardcoding values.
- **Tile-based maps**: 2D arrays in `src/levels/`, rendered via offscreen canvases. Levels are connected directionally (LEFT/RIGHT) in `src/levels/index.ts`.
- **State persistence**: Game state encrypted with AES-GCM and stored in `localStorage` (`src/utils/crypto.ts`, `src/utils/storage.ts`).
- **Global state**: `window.jsc` (typed as `ApplicationData`) holds app version, debug flag, crypto key, and current game status.
- **CI/CD**: `.github/workflows/build.yml` runs on release — install, lint, test, Docker build.

## Key Conventions

- **File naming**: PascalCase for classes (`Player.ts`), camelCase for utilities (`game.ts`). One class per file in `src/classes/`, one interface/type/enum per file in `src/models/`.
- **TypeScript**: No `any`. Use `interface` for data shapes, `enum` for finite sets, `class` for entities. Barrel exports in `src/models/index.ts`.
- **Prettier**: No semicolons, single quotes, trailing commas, 80 char width, auto-organize imports via plugin.
- **ESLint**: Flat config. Unused variables/args prefixed with `_` are allowed (`argsIgnorePattern: '^_'`).
- **Testing**: Vitest with `describe`/`it`. Tests as `*.test.ts` next to source. Global mocks for `Image` and canvas context in `src/test-setup.ts`.
- **Assets**: All image/audio paths defined in `src/config.json`. Static files in `frontend/public/`.
