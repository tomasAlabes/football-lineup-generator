import { FootballLineupRenderer } from './renderer.js';
import type { LineupData, LineupConfig, Player, PlayerPositioning, SubstitutesConfig, RecordingOptions, BallConfig, RecordingUIConfig, PlayerWithCoordinates, FieldCoordinates } from './types.js';
import { Team, Position, LayoutType, SubstitutesPosition } from './types.js';
import { RecordingController, type RecordingState } from './recordingController.js';

// Football Lineup Generator - Main entry point for creating lineup visualizations

/**
 * Creates a canvas element with a football lineup visualization
 * @param lineupData The lineup data containing both teams' player positions
 * @param config Optional configuration for the visualization
 * @returns HTMLCanvasElement that can be added to the DOM
 */
export function generateLineup(lineupData: LineupData, config: LineupConfig = {}): HTMLCanvasElement {
  // Create canvas element
  const canvas = document.createElement('canvas');
  
  // Initialize renderer
  const renderer = new FootballLineupRenderer(canvas, config);
  
  // Render the lineup
  renderer.render(lineupData);
  
  return canvas;
}

/**
 * Convenience function to create a lineup from positioning data (backend format)
 * @param positioningData Array of positioning data from backend
 * @param homeTeamName Name of the home team
 * @param awayTeamName Name of the away team
 * @param config Optional configuration for the visualization
 * @returns HTMLCanvasElement that can be added to the DOM
 */
export function generateLineupFromPositioning(
  positioningData: Array<{
    match_id: number;
    player_id: number;
    player_name: string;
    jersey_number?: number;
    team: Team;
    position: Position;
  }>,
  homeTeamName: string,
  awayTeamName: string,
  config: LineupConfig = {}
): HTMLCanvasElement {
  // Group players by team
  const homeTeamPlayers: PlayerPositioning[] = [];
  const awayTeamPlayers: PlayerPositioning[] = [];

  for (const positioning of positioningData) {
    const playerPositioning: PlayerPositioning = {
      player: {
        id: positioning.player_id,
        name: positioning.player_name,
        jerseyNumber: positioning.jersey_number,
      },
      team: positioning.team,
      position: positioning.position,
    };

    if (positioning.team === Team.RED) {
      homeTeamPlayers.push(playerPositioning);
    } else {
      awayTeamPlayers.push(playerPositioning);
    }
  }

  const lineupData: LineupData = {
    matchId: positioningData[0]?.match_id,
    homeTeam: {
      name: homeTeamName,
      players: homeTeamPlayers,
    },
    awayTeam: {
      name: awayTeamName,
      players: awayTeamPlayers,
    },
  };

  return generateLineup(lineupData, config);
}

// Export types and enums for external use
export { Team, Position, LayoutType, SubstitutesPosition };
export { FootballLineupRenderer };
export { RecordingController };
export type { LineupData, LineupConfig, Player, PlayerPositioning, SubstitutesConfig, RecordingOptions, RecordingState, BallConfig, RecordingUIConfig, PlayerWithCoordinates, FieldCoordinates };

// Export default
export default {
  generateLineup,
  generateLineupFromPositioning,
  Team,
  Position,
  LayoutType,
  SubstitutesPosition,
  FootballLineupRenderer,
  RecordingController,
}; 