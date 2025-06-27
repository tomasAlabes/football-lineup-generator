import type { FieldCoordinates } from '../types.js';

export function mirrorCoordinatesForAwayTeam(coords: FieldCoordinates, width: number): FieldCoordinates {
  return {
    x: width - coords.x,
    y: coords.y
  };
} 