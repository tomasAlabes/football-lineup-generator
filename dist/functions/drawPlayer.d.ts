import type { PlayerPositioning, FieldCoordinates } from '../types.js';
export declare function drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerPositioning, coordinates: FieldCoordinates, isHomeTeam: boolean, homeTeamColor: string, awayTeamColor: string, playerCircleSize: number, showJerseyNumbers: boolean, showPlayerNames: boolean, fontSize: number, allPlayerCoordinates?: Array<{
    player: PlayerPositioning;
    coordinates: FieldCoordinates;
}>, shouldPlaceLabelAbove?: boolean): void;
