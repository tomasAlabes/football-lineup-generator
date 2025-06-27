import type { PlayerPositioning, FieldCoordinates } from '../types.js';
interface PlayerWithCoordinates {
    player: PlayerPositioning;
    coordinates: FieldCoordinates;
}
interface LabelPosition {
    player: PlayerPositioning;
    coordinates: FieldCoordinates;
    shouldPlaceLabelAbove: boolean;
}
export declare function calculateLabelPositions(playersWithCoords: PlayerWithCoordinates[], allPlayersWithCoords?: PlayerWithCoordinates[]): LabelPosition[];
export {};
