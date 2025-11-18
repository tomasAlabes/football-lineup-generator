import type { LineupData, LineupConfig, SubstitutesConfig, CustomCoordinatesMap, Team, BallConfig, RecordingOptions, PlayerPositioning, FieldCoordinates, RecordingUIConfig } from '../types.js';
import { Position } from '../types.js';
import type { RecordingState } from '../recordingController.js';
import { drawField } from './drawField.js';
import { drawTeamLabel } from './drawTeamLabel.js';
import { calculatePlayerCoordinates } from './calculatePlayerCoordinates.js';
import { calculateLabelPositions } from './calculateLabelPositions.js';
import { drawPlayer } from './drawPlayer.js';
import { drawSubstitutesList } from './drawSubstitutesList.js';


interface PlayerWithCoordinates {
  player: PlayerPositioning;
  coordinates: FieldCoordinates;
  isHomeTeam: boolean;
}

export function renderHalfPitch(
  ctx: CanvasRenderingContext2D,
  lineupData: LineupData,
  config: Required<Omit<LineupConfig, 'showSubstitutes' | 'interactive' | 'onPlayerMove' | 'recording' | 'recordingOptions' | 'recordingUI' | 'onRecordingStateChange' | 'ball' | 'onBallMove'>> & {
    showSubstitutes: SubstitutesConfig;
    interactive?: boolean;
    onPlayerMove?: (playerId: number, team: Team, x: number, y: number) => void;
    recording?: boolean;
    recordingOptions?: RecordingOptions;
    recordingUI?: boolean | RecordingUIConfig;
    onRecordingStateChange?: (state: RecordingState) => void;
    ball?: BallConfig;
    onBallMove?: (x: number, y: number) => void;
  },
  customCoordinates?: CustomCoordinatesMap
): PlayerWithCoordinates[] {
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

  // Calculate coordinates for home team players (left half, exclude substitutes)
  const homeFieldPlayers = lineupData.homeTeam.players.filter(p => p.position !== Position.SUBSTITUTE);
  const homePlayerCoords = calculatePlayerCoordinates(
    homeFieldPlayers,
    config.width,
    config.height,
    config.layoutType,
    0,
    true,
    true,
    0
  );

  // Calculate coordinates for away team players (right half, exclude substitutes)
  const awayFieldPlayers = lineupData.awayTeam.players.filter(p => p.position !== Position.SUBSTITUTE);
  const awayPlayerCoords = calculatePlayerCoordinates(
    awayFieldPlayers,
    config.width,
    config.height,
    config.layoutType,
    0,
    true,
    false,
    0
  );

  // Apply custom coordinates AFTER calculations
  if (customCoordinates) {
    homePlayerCoords.forEach((playerCoord) => {
      const key = `${playerCoord.player.team}-${playerCoord.player.player.id}`;
      const customCoord = customCoordinates.get(key);
      if (customCoord) {
        playerCoord.coordinates = customCoord;
      }
    });

    awayPlayerCoords.forEach((playerCoord) => {
      const key = `${playerCoord.player.team}-${playerCoord.player.player.id}`;
      const customCoord = customCoordinates.get(key);
      if (customCoord) {
        playerCoord.coordinates = customCoord;
      }
    });
  }

  // Calculate smart label positions with cross-team proximity analysis
  const allPlayersWithCoords = [...homePlayerCoords, ...awayPlayerCoords];
  const playersWithLabelPositions = calculateLabelPositions(allPlayersWithCoords, allPlayersWithCoords);

  // Draw home team players (left half)
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

  // Draw away team players (right half)
  for (const playerWithLabel of playersWithLabelPositions) {
    const isAwayPlayer = awayPlayerCoords.some(ap => ap.player === playerWithLabel.player);
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
  return [
    ...homePlayerCoords.map(pc => ({ ...pc, isHomeTeam: true })),
    ...awayPlayerCoords.map(pc => ({ ...pc, isHomeTeam: false }))
  ];
} 