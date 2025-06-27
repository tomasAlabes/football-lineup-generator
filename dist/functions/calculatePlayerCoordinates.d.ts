import type { PlayerPositioning, FieldCoordinates } from '../types.js';
import { LayoutType } from '../types.js';
interface PlayerCoordinates {
    player: PlayerPositioning;
    coordinates: FieldCoordinates;
}
export declare function calculatePlayerCoordinates(players: PlayerPositioning[], width: number, height: number, layoutType: LayoutType, fieldOffsetX?: number, isHalfPitch?: boolean, isHomeTeam?: boolean, teamOffsetX?: number): PlayerCoordinates[];
export {};
