import type { LineupData, LineupConfig } from '../types.js';
import { Position } from '../types.js';
import { drawField } from './drawField.js';
import { drawTeamLabel } from './drawTeamLabel.js';
import { calculatePlayerCoordinates } from './calculatePlayerCoordinates.js';
import { calculateLabelPositions } from './calculateLabelPositions.js';
import { drawPlayer } from './drawPlayer.js';
import { mirrorCoordinatesForAwayTeam } from './mirrorCoordinates.js';
import { drawSubstitutesList } from './drawSubstitutesList.js';


export function renderFullPitch(
  ctx: CanvasRenderingContext2D,
  lineupData: LineupData,
  config: Required<LineupConfig>
): void {
  // Draw field
  drawField(
    ctx,
    config.width,
    config.height,
    config.fieldColor,
    config.lineColor
  );

  // Draw team labels
  drawTeamLabel(
    ctx,
    lineupData.homeTeam.name,
    true,
    config.width,
    config.homeTeamColor,
    config.awayTeamColor,
    config.fontSize
  );
  drawTeamLabel(
    ctx,
    lineupData.awayTeam.name,
    false,
    config.width,
    config.homeTeamColor,
    config.awayTeamColor,
    config.fontSize
  );

  // Calculate coordinates for home team players (exclude substitutes)
  // Apply -20px offset to move home team left and prevent center overlap
  const homeFieldPlayers = lineupData.homeTeam.players.filter(p => p.position !== Position.SUBSTITUTE);
  const homePlayerCoords = calculatePlayerCoordinates(
    homeFieldPlayers,
    config.width,
    config.height,
    config.layoutType,
    0,
    false,
    true,
    -20 // Move home team left by 20px
  );

  // Calculate coordinates for away team players (exclude substitutes)
  // Apply -20px offset which will become +20px after mirroring, moving away team right
  const awayFieldPlayers = lineupData.awayTeam.players.filter(p => p.position !== Position.SUBSTITUTE);
  const awayPlayerCoords = calculatePlayerCoordinates(
    awayFieldPlayers,
    config.width,
    config.height,
    config.layoutType,
    0,
    false,
    false,
    -20 // This becomes +20px after mirroring, moving away team right
  );

  // Create mirrored coordinates for away team
  const awayPlayerCoordsWithMirroring = awayPlayerCoords.map(({ player, coordinates }) => ({
    player,
    coordinates: mirrorCoordinatesForAwayTeam(coordinates, config.width)
  }));

  // Calculate smart label positions with cross-team proximity analysis
  const allPlayersWithCoords = [...homePlayerCoords, ...awayPlayerCoordsWithMirroring];
  const playersWithLabelPositions = calculateLabelPositions(allPlayersWithCoords, allPlayersWithCoords);

  // Draw home team players (left side)
  for (const playerWithLabel of playersWithLabelPositions) {
    const isHomePlayer = homePlayerCoords.some(hp => hp.player === playerWithLabel.player);
    if (isHomePlayer) {
      drawPlayer(
        ctx,
        playerWithLabel.player,
        playerWithLabel.coordinates,
        true,
        config.homeTeamColor,
        config.awayTeamColor,
        config.playerCircleSize,
        config.showJerseyNumbers,
        config.showPlayerNames,
        config.fontSize,
        allPlayersWithCoords,
        playerWithLabel.shouldPlaceLabelAbove
      );
    }
  }

  // Draw away team players (right side, mirrored)
  for (const playerWithLabel of playersWithLabelPositions) {
    const isAwayPlayer = awayPlayerCoordsWithMirroring.some(ap => ap.player === playerWithLabel.player);
    if (isAwayPlayer) {
      drawPlayer(
        ctx,
        playerWithLabel.player,
        playerWithLabel.coordinates,
        false,
        config.homeTeamColor,
        config.awayTeamColor,
        config.playerCircleSize,
        config.showJerseyNumbers,
        config.showPlayerNames,
        config.fontSize,
        allPlayersWithCoords,
        playerWithLabel.shouldPlaceLabelAbove
      );
    }
  }

  // Draw substitutes list if enabled
  if (config.showSubstitutes) {
    drawSubstitutesList(
      ctx,
      lineupData,
      config.height,
      config.homeTeamColor,
      config.awayTeamColor,
      config.fontSize
    );
  }
} 