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
 * Unrotates coordinates (reverses 90 degrees counter-clockwise rotation)
 * This is a 90-degree clockwise rotation
 * @param coords Rotated coordinates
 * @param originalWidth Original width before rotation
 * @param originalHeight Original height before rotation (now the rotated width)
 * @returns Unrotated coordinates
 */
export declare function unrotateCoordinates90CCW(coords: FieldCoordinates, originalWidth: number, originalHeight: number): FieldCoordinates;
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
