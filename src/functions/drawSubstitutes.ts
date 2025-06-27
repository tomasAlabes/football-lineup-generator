import type { LineupData } from '../types.js';
import { Position } from '../types.js';
import { drawPlayer } from './drawPlayer.js';

export function drawSubstitutes(
  ctx: CanvasRenderingContext2D,
  lineupData: LineupData,
  width: number,
  homeTeamColor: string,
  awayTeamColor: string,
  playerCircleSize: number,
  showJerseyNumbers: boolean,
  showPlayerNames: boolean,
  fontSize: number
): void {
  const substituteStartY = 100;
  const substituteSpacing = 60; // Increased spacing from 40 to 60
  let homeSubIndex = 0;
  let awaySubIndex = 0;

  for (const player of lineupData.homeTeam.players) {
    if (player.position === Position.SUBSTITUTE) {
      const coords = { x: 50, y: substituteStartY + homeSubIndex * substituteSpacing }; // Moved further from edge
      drawPlayer(
        ctx,
        player,
        coords,
        true,
        homeTeamColor,
        awayTeamColor,
        playerCircleSize,
        showJerseyNumbers,
        showPlayerNames,
        fontSize,
        [], // No nearby players for substitutes
        false // Default label position below
      );
      homeSubIndex++;
    }
  }

  for (const player of lineupData.awayTeam.players) {
    if (player.position === Position.SUBSTITUTE) {
      const coords = { x: width + 70, y: substituteStartY + awaySubIndex * substituteSpacing }; // Positioned in the extra canvas space
      drawPlayer(
        ctx,
        player,
        coords,
        false,
        homeTeamColor,
        awayTeamColor,
        playerCircleSize,
        showJerseyNumbers,
        showPlayerNames,
        fontSize,
        [], // No nearby players for substitutes
        false // Default label position below
      );
      awaySubIndex++;
    }
  }
} 