# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Context

**This is a fork of [ncamaa/football-lineup-generator](https://github.com/ncamaa/football-lineup-generator).** This is not my original repository - I forked it to fix some issues I encountered while using the library.

## Overview

Football Lineup Generator is a TypeScript library for generating visual football (soccer) lineup diagrams from team positioning data using HTML5 Canvas. It renders customizable football field visualizations with player positions, team labels, and substitutes.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Build the TypeScript source to JavaScript (outputs to dist/)
npm run build

# Development mode: compile + watch + serve on http://localhost:3000
npm run dev
npm start  # alias for npm run dev

# Watch mode only (auto-recompile TypeScript on changes)
npm run watch

# Serve only (HTTP server on port 3000)
npm run serve
```

**Development workflow**: Run `npm run dev` to start TypeScript watch mode and HTTP server simultaneously. Open http://localhost:3000 to view `example.html` which loads the compiled library from `dist/index.js`. Changes to `src/` files are automatically compiled.

**No tests configured**: The project currently has no test suite (`npm test` exits with error).

## Architecture

### Entry Points

- **src/index.ts**: Main library entry point
  - Exports `generateLineup()` - creates canvas from LineupData
  - Exports `generateLineupFromPositioning()` - creates canvas from backend positioning format
  - Exports `FootballLineupRenderer` class, enums (Team, Position, LayoutType), and types

### Core Components

**FootballLineupRenderer (src/renderer.ts)**
- Main rendering class that manages canvas, context, and configuration
- Constructor accepts HTMLCanvasElement and LineupConfig
- `render(lineupData)` method orchestrates the rendering by calling layout-specific functions
- Handles canvas sizing (adjusts dimensions for SPLIT_PITCH layout which uses rotated view)

**Layout System (src/functions/render*.ts)**
Three distinct rendering strategies:
- `renderFullPitch()`: Both teams positioned across entire field with mirrored coordinates for away team
- `renderHalfPitch()`: Each team constrained to their respective half using `getHalfPitchCoordinates()`
- `renderSplitPitch()`: Two rotated pitches side-by-side, each showing one team's formation

### Coordinate System

**Position Mapping (src/functions/getPositionCoordinates.ts)**
- Maps football positions (goalkeeper, defenders, midfielders, forwards) to field coordinates
- Uses percentage-based positioning: goalkeeper at 8% width, defenders at 25%, midfielders at 40-70%, forwards at 88%
- Vertical spacing uses percentages (0.2, 0.35, 0.5, 0.65, 0.8) to prevent player overlap
- Returns PositionCoordinates object keyed by Position enum
- Accepts `fieldOffsetX` parameter for split pitch layouts

**Coordinate Transformations**
- `mirrorCoordinates.ts`: Mirrors x-coordinates for away team in full/half pitch (formula: `width - x`)
- `rotateCoordinates.ts`: Rotates coordinates 90° counter-clockwise for split pitch layout
- `getHalfPitchCoordinates.ts`: Constrains team to their half by shifting x-coordinates

**Label Collision Detection (src/functions/calculateLabelPositions.ts)**
- Analyzes proximity between all players (cross-team aware)
- Determines whether to place player name labels above or below circles to minimize overlap
- Returns array with `shouldPlaceLabelAbove` boolean for each player

### Drawing Functions

Located in `src/functions/`:
- `drawField.ts` / `drawFieldRotated.ts`: Draw field markings (center circle, penalty boxes, corner arcs)
- `drawPlayer.ts`: Renders player circle, jersey number, and name label
- `drawTeamLabel.ts` / `drawTeamLabelRotated.ts`: Renders team names on field
- `drawSubstitutes.ts` / `drawSubstitutesSplit.ts`: Renders substitute players off-field
- `calculatePlayerCoordinates.ts`: Main coordinator that fetches position coordinates and maps players to them

### Type System (src/types.ts)

**Enums**
- `Team`: RED, YELLOW (team colors/sides)
- `Position`: 15 positions (goalkeeper, 4 defenders, 5 midfielders, 4 forwards, substitute)
- `LayoutType`: FULL_PITCH, HALF_PITCH, SPLIT_PITCH

**Key Interfaces**
- `LineupData`: Contains matchId, homeTeam, awayTeam (each with name, players array)
- `PlayerPositioning`: Links Player to Team and Position
- `LineupConfig`: All rendering options (dimensions, colors, font sizes, layout type)
- `FieldCoordinates`: Simple {x, y} object
- `PositionCoordinates`: Map of Position enum to FieldCoordinates

## Important Implementation Details

**Full Pitch Layout Anti-Overlap Strategy**
Home team players have -20px x-offset, away team players get +20px offset after mirroring. This prevents center-positioned players from overlapping when teams face each other.

**Split Pitch Rotation**
Split pitch layout rotates the field 90° counter-clockwise. Canvas dimensions are swapped: `canvas.width = height * 2 + 60` (two rotated pitches side-by-side), `canvas.height = width`.

**Substitute Rendering**
Players with `Position.SUBSTITUTE` are filtered out from field rendering and drawn separately off-field using specialized functions.

**No Background Image in Current Implementation**
README mentions `backgroundImage` config option, but the current rendering functions (`drawField.ts`) only use solid `fieldColor`. Background image support would need to be implemented in the field drawing functions.

**Compilation Target**
TypeScript compiles to ES2020 with ESM modules. The `.js` extension is included in imports (e.g., `'./types.js'`) for ESM compatibility.

## File Organization

```
src/
├── types.ts              # Type definitions and enums
├── index.ts              # Main entry point and exports
├── renderer.ts           # FootballLineupRenderer class
└── functions/
    ├── index.ts          # Re-exports all functions
    ├── render*.ts        # Layout-specific rendering (Full/Half/Split)
    ├── getPositionCoordinates.ts    # Position-to-coordinate mapping
    ├── calculate*.ts     # Coordinate calculations and transformations
    ├── draw*.ts          # Canvas drawing primitives
    └── mirror/rotate/getHalfPitch   # Coordinate transformations
```

## GitHub Pages Demo

The repository includes `index.html` and `example.html` which are served via GitHub Pages at https://ncamaa.github.io/football-lineup-generator/. The static site workflow is configured in `.github/workflows/static.yml`.
