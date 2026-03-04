import type { PlayerPositioning, FieldCoordinates } from '../types.js';
import { Position, LayoutType } from '../types.js';

interface PlayerCoordinates {
  player: PlayerPositioning;
  coordinates: FieldCoordinates;
}

export function calculatePlayerCoordinates(
  players: PlayerPositioning[],
  width: number,
  height: number,
  layoutType: LayoutType,
  fieldOffsetX = 0,
  isHalfPitch = false,
  isHomeTeam = true,
  teamOffsetX = 0
): PlayerCoordinates[] {
  // Group players by position
  const playersByPosition = new Map<Position, PlayerPositioning[]>();

  for (const player of players) {
    if (!playersByPosition.has(player.position)) {
      playersByPosition.set(player.position, []);
    }
    const positionPlayers = playersByPosition.get(player.position);
    if (positionPlayers) {
      positionPlayers.push(player);
    }
  }

  const result: PlayerCoordinates[] = [];

  // Calculate base coordinates for each position
  for (const [position, positionPlayers] of playersByPosition.entries()) {
    const baseCoords = getBasePositionCoordinates(position, width, height, layoutType, fieldOffsetX, isHalfPitch, isHomeTeam);

    // Apply team offset to base coordinates
    const teamAdjustedCoords = {
      x: baseCoords.x + teamOffsetX,
      y: baseCoords.y
    };

    if (positionPlayers.length === 1) {
      // Single player - use team adjusted coordinates
      result.push({
        player: positionPlayers[0],
        coordinates: teamAdjustedCoords
      });
    } else {
      // Multiple players - spread them around the team adjusted base position
      for (let index = 0; index < positionPlayers.length; index++) {
        const player = positionPlayers[index];
        const offsetCoords = calculatePositionOffset(teamAdjustedCoords, index, positionPlayers.length, position, layoutType);
        result.push({
          player,
          coordinates: offsetCoords
        });
      }
    }
  }

  return result;
}

function getBasePositionCoordinates(
  position: Position,
  width: number,
  height: number,
  layoutType: LayoutType,
  fieldOffsetX: number,
  isHalfPitch: boolean,
  isHomeTeam: boolean
): FieldCoordinates {
  if (isHalfPitch) {
    return getHalfPitchBaseCoords(position, width, height, isHomeTeam);
  }
  return getFullPitchBaseCoords(position, width, height, layoutType, fieldOffsetX);
}

function getFullPitchBaseCoords(
  position: Position,
  width: number,
  height: number,
  layoutType: LayoutType,
  fieldOffsetX: number
): FieldCoordinates {
  const actualWidth = layoutType === LayoutType.SPLIT_PITCH ? width : width;
  const fieldMargin = 50;
  const fieldWidth = actualWidth - 2 * fieldMargin;

  const baseCoords = {
    [Position.GOALKEEPER]: { x: fieldMargin + fieldWidth * 0.08, y: height / 2 },
    [Position.LEFT_BACK]: { x: fieldMargin + fieldWidth * 0.27, y: height * 0.2 },
    [Position.CENTER_BACK]: { x: fieldMargin + fieldWidth * 0.25, y: height * 0.5 },
    [Position.RIGHT_BACK]: { x: fieldMargin + fieldWidth * 0.27, y: height * 0.8 },
    [Position.DEFENSIVE_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.45, y: height / 2 },
    [Position.LEFT_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.6, y: height * 0.2 },
    [Position.CENTER_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.65, y: height / 2 },
    [Position.RIGHT_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.6, y: height * 0.8 },
    [Position.ATTACKING_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.67, y: height / 2 },
    [Position.LEFT_WINGER]: { x: fieldMargin + fieldWidth * 0.75, y: height * 0.2 },
    [Position.RIGHT_WINGER]: { x: fieldMargin + fieldWidth * 0.75, y: height * 0.8 },
    [Position.LEFT_FORWARD]: { x: fieldMargin + fieldWidth * 0.88, y: height * 0.35 },
    [Position.CENTER_FORWARD]: { x: fieldMargin + fieldWidth * 0.85, y: height / 2 },
    [Position.RIGHT_FORWARD]: { x: fieldMargin + fieldWidth * 0.85, y: height * 0.65 },
    [Position.SUBSTITUTE]: { x: actualWidth + 20, y: height / 2 },
  };

  const coords = baseCoords[position];
  return {
    x: coords.x + fieldOffsetX,
    y: coords.y
  };
}

function getHalfPitchBaseCoords(
  position: Position,
  width: number,
  height: number,
  isHomeTeam: boolean
): FieldCoordinates {
  const fieldMargin = 50;
  const fieldWidth = width - 2 * fieldMargin;
  const halfWidth = fieldWidth / 2;
  const baseX = isHomeTeam ? fieldMargin : fieldMargin + halfWidth;

  // For away team, mirror X fractions so GK is near their goal (right edge)
  const xf = (fraction: number) => baseX + halfWidth * (isHomeTeam ? fraction : 1 - fraction);

  const baseCoords: Record<Position, FieldCoordinates> = {
    [Position.GOALKEEPER]: { x: xf(0.15), y: height / 2 },
    [Position.LEFT_BACK]: { x: xf(0.45), y: height * 0.15 },
    [Position.CENTER_BACK]: { x: xf(0.4), y: height * 0.5 },
    [Position.RIGHT_BACK]: { x: xf(0.45), y: height * 0.85 },
    [Position.DEFENSIVE_MIDFIELDER]: { x: xf(0.55), y: height * 0.5 },
    [Position.LEFT_MIDFIELDER]: { x: xf(0.75), y: height * 0.2 },
    [Position.CENTER_MIDFIELDER]: { x: xf(0.68), y: height * 0.5 },
    [Position.RIGHT_MIDFIELDER]: { x: xf(0.75), y: height * 0.8 },
    [Position.ATTACKING_MIDFIELDER]: { x: xf(0.85), y: height * 0.5 },
    [Position.LEFT_WINGER]: { x: xf(0.9), y: height * 0.15 },
    [Position.RIGHT_WINGER]: { x: xf(0.9), y: height * 0.85 },
    [Position.LEFT_FORWARD]: { x: xf(0.95), y: height * 0.35 },
    [Position.CENTER_FORWARD]: { x: xf(0.95), y: height * 0.5 },
    [Position.RIGHT_FORWARD]: { x: xf(0.95), y: height * 0.65 },
    [Position.SUBSTITUTE]: { x: width + 20, y: height / 2 },
  };

  return baseCoords[position];
}

function calculatePositionOffset(
  baseCoords: FieldCoordinates,
  playerIndex: number,
  totalPlayers: number,
  position: Position,
  layoutType: LayoutType
): FieldCoordinates {
  // Increased offset distance for better separation
  const baseOffsetDistance = 35; // Increased from 25
  
  // Additional offset for same-position players to prevent label overlap
  const labelOffsetMultiplier = totalPlayers > 1 ? 1.5 : 1;
  const offsetDistance = baseOffsetDistance * labelOffsetMultiplier;
  
  if (totalPlayers === 2) {
    // For 2 players, place them with larger separation
    const offset = playerIndex === 0 ? -offsetDistance/1.5 : offsetDistance/1.5;

    if (layoutType === LayoutType.SPLIT_PITCH) {
      // Split pitch rotates 90° CCW: (x,y) → (y, width-x)
      // Pre-rotation Y-offset becomes post-rotation X-offset (perpendicular to goal)
      // Pre-rotation X-offset becomes post-rotation Y-offset
      if (isVerticalPosition(position)) {
        return { x: baseCoords.x, y: baseCoords.y + offset };
      }
      return { x: baseCoords.x + offset, y: baseCoords.y };
    }

    // FULL_PITCH / HALF_PITCH: Y-axis is perpendicular to goal line
    if (isVerticalPosition(position)) {
      return { x: baseCoords.x, y: baseCoords.y + offset };
    }
    return { x: baseCoords.x + offset, y: baseCoords.y };
  }
  
  if (totalPlayers === 3) {
    // Triangle: 1 player deeper, 2 spread perpendicular to goal line
    // Defenders use tighter spacing, midfielders/forwards use wider
    const isDefender = [Position.CENTER_BACK, Position.LEFT_BACK, Position.RIGHT_BACK].includes(position);
    const isMidfielder = [Position.CENTER_MIDFIELDER, Position.DEFENSIVE_MIDFIELDER, Position.ATTACKING_MIDFIELDER].includes(position);
    const spreadMultiplier = isDefender ? 1.5 : isMidfielder ? 2.5 : 2;

    // depth = along goal-to-goal axis, spread = perpendicular to it
    const depthOffset = (isMidfielder ? offsetDistance * 1.2 : offsetDistance / 3);
    const spreadOffset = offsetDistance * spreadMultiplier;

    // Offsets in (depth, spread) space: one deep, two wide
    const logicalOffsets = [
      { depth: 0, spread: 0 },
      { depth: depthOffset, spread: -spreadOffset },
      { depth: depthOffset, spread: spreadOffset }
    ];

    const lo = logicalOffsets[playerIndex];

    if (layoutType === LayoutType.SPLIT_PITCH) {
      // Pre-rotation: X = depth (goal-to-goal), Y = spread (perpendicular)
      // After 90° CCW rotation these swap correctly
      return {
        x: baseCoords.x + lo.depth,
        y: baseCoords.y + lo.spread
      };
    }

    // FULL_PITCH / HALF_PITCH: X = depth (goal-to-goal), Y = spread (perpendicular)
    return {
      x: baseCoords.x + lo.depth,
      y: baseCoords.y + lo.spread
    };
  }
  
  // For more than 3 players, create a wider grid
  // cols = along perpendicular axis (spread), rows = along depth axis
  const cols = Math.ceil(Math.sqrt(totalPlayers));
  const rows = Math.ceil(totalPlayers / cols);

  const col = playerIndex % cols;
  const row = Math.floor(playerIndex / cols);

  const depthOffset = (row - (rows - 1) / 2) * (offsetDistance / 1.2);
  const spreadOffset = (col - (cols - 1) / 2) * (offsetDistance / 1.2);

  // For all layouts: X = depth (goal-to-goal), Y = spread (perpendicular)
  // Split pitch rotation handles the final mapping
  return {
    x: baseCoords.x + depthOffset,
    y: baseCoords.y + spreadOffset
  };
}

function isVerticalPosition(position: Position): boolean {
  // Positions that should be offset vertically when there are multiple players
  return [
    Position.CENTER_BACK,
    Position.DEFENSIVE_MIDFIELDER,
    Position.CENTER_MIDFIELDER,
    Position.ATTACKING_MIDFIELDER,
    Position.CENTER_FORWARD
  ].includes(position);
} 