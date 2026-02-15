# JSC's Mumu's Adventures

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

## Development Status
The game is under active development and represents a complete rewrite from the original Phaser-based version. The codebase is designed to be simpler and more maintainable while enabling unit testing for quality assurance.

## Controls
- **Keyboard**: WASD or Arrow Keys for movement, Space to interact, G to pick up items, Q to toggle audio
- **Touch**: 3x3 grid touch controls that map to directional inputs

## Assets
- Maps created using Tiled map editor and converted to JSON
- Tilesets from Pixel Boy's Ninja Adventure asset pack
- Character sprites from Lumi's cute female NPCs

## Build Process
- Uses Vite for development server and production builds
- TypeScript compilation with type checking
- ESLint for code quality
- Unit testing with Vitest and coverage reporting
- Automated version updates and tagging

## Future Development
The game is actively being developed with plans to expand the world, add more NPCs, and enhance gameplay mechanics. The codebase is designed to be extensible and maintainable.