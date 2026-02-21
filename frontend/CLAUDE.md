# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
JSC's Mumu's Adventures is a web-based adventure game built with TypeScript and HTML5 Canvas. The game features a hero character named Mumu who embarks on an adventure to defeat the evil Maginta Llennaspom.

## Game Features
- Intro screen with spacebar start functionality
- Single map divided into 2 screens
- Simple NPC interactions
- Keyboard and touch controls
- Mobile-friendly design with responsive canvas rendering
- Visual gamepad interface (currently unused)

## Technical Architecture
- Built with plain TypeScript (no external dependencies)
- Uses HTML5 Canvas for rendering
- Implements a custom game engine without frameworks like Phaser
- Supports unit testing for code quality
- Uses Vite for development and build processes
- Includes TypeScript compilation and ESLint for code quality

## Key Components
- **Player Class**: Handles character movement, animations, and inventory
- **Level System**: Manages map data, collision detection, and level transitions
- **Input Handling**: Supports keyboard (WASD, arrow keys) and touch controls
- **Touch Input System**: Implements 3x3 grid touch controls with quadrant mapping
- **GamePad Class**: Visual 3x3 grid gamepad controller (currently unused)
- **Collision Detection**: Block-based collision system for player movement
- **NPC System**: Interactive non-player characters with dialogue

## Development Commands
- `yarn dev` - Start development server with hot reloading
- `yarn build` - Build production version
- `yarn test` - Run all tests
- `yarn test:coverage` - Run tests with coverage report
- `yarn lint` - Run ESLint for code quality
- `yarn gen-map` - Generate map data from Tiled maps
- `yarn split-sprite` - Split sprite sheets into individual sprites
- `yarn format` - Format code with Prettier

**Important**: This project uses `yarn` exclusively for package management. Never use `npm` commands. All development dependencies and scripts are configured for `yarn` only.

## Project Structure
- `src/` - Main source code directory
  - `src/classes/` - Game object classes (Player, NPC, etc.)
  - `src/levels/` - Level data and configuration
  - `src/models/` - Data models and interfaces
  - `src/utils/` - Utility functions and helpers
  - `src/intro/` - Intro screen logic
  - `src/images/` - Game assets
  - `src/sprites/` - Sprite configuration
- `public/` - Static assets and fonts
- `tests/` - Unit tests (in src directory with .test.ts extension)

## Testing
The project uses Vitest for unit testing with coverage reporting. Tests are located alongside the source files with a `.test.ts` extension. The test setup is configured in `src/test-setup.ts`.

## Build Process
- Uses Vite for development server and production builds
- TypeScript compilation with type checking
- ESLint for code quality
- Unit testing with Vitest and coverage reporting
- Automated version updates and tagging