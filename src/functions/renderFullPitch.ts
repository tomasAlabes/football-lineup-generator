import type { LineupData, LineupConfig, SubstitutesConfig, CustomCoordinatesMap } from '../types.js';
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
  config: Required<Omit<LineupConfig, 'showSubstitutes' | 'interactive' | 'onPlayerMove' | 'recording' | 'recordingOptions' | 'onRecordingStateChange'>> & {
    showSubstitutes: SubstitutesConfig;
    interactive?: boolean;
    onPlayerMove?: (playerId: number, team: any, x: number, y: number) => void;
    recording?: boolean;
    recordingOptions?: any;
    onRecordingStateChange?: any;
  },
  customCoordinates?: CustomCoordinatesMap
): any[] {
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

  // Apply custom coordinates AFTER transformations
  if (customCoordinates) {
    homePlayerCoords.forEach((playerCoord) => {
      const key = `${playerCoord.player.team}-${playerCoord.player.player.id}`;
      const customCoord = customCoordinates.get(key);
      if (customCoord) {
        playerCoord.coordinates = customCoord;
      }
    });

    awayPlayerCoordsWithMirroring.forEach((playerCoord) => {
      const key = `${playerCoord.player.team}-${playerCoord.player.player.id}`;
      const customCoord = customCoordinates.get(key);
      if (customCoord) {
        playerCoord.coordinates = customCoord;
      }
    });
  }

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
  if (config.showSubstitutes.enabled) {
    drawSubstitutesList(
      ctx,
      lineupData,
      config.width,
      config.height,
      config.homeTeamColor,
      config.awayTeamColor,
      config.fontSize,
      config.showSubstitutes.position
    );
  }

  // Return all player coordinates for interactive controller
  // Note: Don't use spread operator here as it would lose the mutations made above
  const homeCoords = homePlayerCoords.map(pc => ({ ...pc, isHomeTeam: true }));
  const awayCoords = awayPlayerCoordsWithMirroring.map(pc => ({ ...pc, isHomeTeam: false }));

  return [...homeCoords, ...awayCoords];
} 