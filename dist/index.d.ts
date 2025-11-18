import { FootballLineupRenderer } from './renderer.js';
import type { LineupData, LineupConfig, Player, PlayerPositioning, SubstitutesConfig, RecordingOptions, BallConfig, RecordingUIConfig } from './types.js';
import { Team, Position, LayoutType, SubstitutesPosition } from './types.js';
import { RecordingController, type RecordingState } from './recordingController.js';
/**
 * Creates a canvas element with a football lineup visualization
 * @param lineupData The lineup data containing both teams' player positions
 * @param config Optional configuration for the visualization
 * @returns HTMLCanvasElement that can be added to the DOM
 */
export declare function generateLineup(lineupData: LineupData, config?: LineupConfig): HTMLCanvasElement;
/**
 * Convenience function to create a lineup from positioning data (backend format)
 * @param positioningData Array of positioning data from backend
 * @param homeTeamName Name of the home team
 * @param awayTeamName Name of the away team
 * @param config Optional configuration for the visualization
 * @returns HTMLCanvasElement that can be added to the DOM
 */
export declare function generateLineupFromPositioning(positioningData: Array<{
    match_id: number;
    player_id: number;
    player_name: string;
    jersey_number?: number;
    team: Team;
    position: Position;
}>, homeTeamName: string, awayTeamName: string, config?: LineupConfig): HTMLCanvasElement;
export { Team, Position, LayoutType, SubstitutesPosition };
export { FootballLineupRenderer };
export { RecordingController };
export type { LineupData, LineupConfig, Player, PlayerPositioning, SubstitutesConfig, RecordingOptions, RecordingState, BallConfig, RecordingUIConfig };
declare const _default: {
    generateLineup: typeof generateLineup;
    generateLineupFromPositioning: typeof generateLineupFromPositioning;
    Team: typeof Team;
    Position: typeof Position;
    LayoutType: typeof LayoutType;
    SubstitutesPosition: typeof SubstitutesPosition;
    FootballLineupRenderer: typeof FootballLineupRenderer;
    RecordingController: typeof RecordingController;
};
export default _default;
