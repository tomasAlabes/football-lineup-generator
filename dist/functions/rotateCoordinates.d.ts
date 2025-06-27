import type { FieldCoordinates, PlayerPositioning } from '../types.js';
/**
 * Rotates coordinates 90 degrees counter-clockwise
 * @param coords Original coordinates
 * @param originalWidth Original width before rotation
 * @param originalHeight Original height before rotation
 * @returns Rotated coordinates
 */
export declare function rotateCoordinates90CCW(coords: FieldCoordinates, originalWidth: number, originalHeight: number): FieldCoordinates;
/**
 * Rotates multiple coordinates 90 degrees counter-clockwise
 */
export declare function rotatePlayerCoordinates90CCW(playersWithCoords: Array<{
    player: PlayerPositioning;
    coordinates: FieldCoordinates;
}>, originalWidth: number, originalHeight: number): Array<{
    player: PlayerPositioning;
    coordinates: FieldCoordinates;
}>;
