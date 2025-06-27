import type { PositionCoordinates } from '../types.js';
import { Position } from '../types.js';

export function getHalfPitchCoordinates(width: number, height: number, isHomeTeam: boolean): PositionCoordinates {
  const fieldMargin = 50;
  const fieldWidth = width - 2 * fieldMargin;
  const halfWidth = fieldWidth / 2;
  const baseX = isHomeTeam ? fieldMargin : fieldMargin + halfWidth;

  // Much better spacing for half pitch to avoid overlaps
  return {
    // Goalkeeper
    [Position.GOALKEEPER]: { x: baseX + halfWidth * 0.15, y: height / 2 },
    
    // Defenders - distributed better vertically
    [Position.LEFT_BACK]: { x: baseX + halfWidth * 0.4, y: height * 0.15 },
    [Position.CENTER_BACK]: { x: baseX + halfWidth * 0.4, y: height * 0.5 },
    [Position.RIGHT_BACK]: { x: baseX + halfWidth * 0.4, y: height * 0.85 },
    
    // Midfielders - staggered formation to avoid overlaps
    [Position.DEFENSIVE_MIDFIELDER]: { x: baseX + halfWidth * 0.6, y: height * 0.35 },
    [Position.LEFT_MIDFIELDER]: { x: baseX + halfWidth * 0.75, y: height * 0.2 },
    [Position.CENTER_MIDFIELDER]: { x: baseX + halfWidth * 0.6, y: height * 0.65 },
    [Position.RIGHT_MIDFIELDER]: { x: baseX + halfWidth * 0.75, y: height * 0.8 },
    [Position.ATTACKING_MIDFIELDER]: { x: baseX + halfWidth * 0.85, y: height * 0.5 },
    
    // Wingers and Forwards - better distribution
    [Position.LEFT_WINGER]: { x: baseX + halfWidth * 0.9, y: height * 0.15 },
    [Position.RIGHT_WINGER]: { x: baseX + halfWidth * 0.9, y: height * 0.85 },
    [Position.LEFT_FORWARD]: { x: baseX + halfWidth * 0.95, y: height * 0.35 },
    [Position.CENTER_FORWARD]: { x: baseX + halfWidth * 0.95, y: height * 0.5 },
    [Position.RIGHT_FORWARD]: { x: baseX + halfWidth * 0.95, y: height * 0.65 },
    
    // Substitutes
    [Position.SUBSTITUTE]: { x: width + 20, y: height / 2 },
  };
} 