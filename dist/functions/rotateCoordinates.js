/**
 * Rotates coordinates 90 degrees counter-clockwise
 * @param coords Original coordinates
 * @param originalWidth Original width before rotation
 * @param originalHeight Original height before rotation
 * @returns Rotated coordinates
 */
export function rotateCoordinates90CCW(coords, originalWidth, originalHeight) {
    // For 90-degree counter-clockwise rotation: (x, y) -> (y, originalWidth - x)
    return {
        x: coords.y,
        y: originalWidth - coords.x
    };
}
/**
 * Unrotates coordinates (reverses 90 degrees counter-clockwise rotation)
 * This is a 90-degree clockwise rotation
 * @param coords Rotated coordinates
 * @param originalWidth Original width before rotation
 * @param originalHeight Original height before rotation (now the rotated width)
 * @returns Unrotated coordinates
 */
export function unrotateCoordinates90CCW(coords, originalWidth, originalHeight) {
    // Reverse of CCW rotation: (x, y) -> (originalWidth - y, x)
    return {
        x: originalWidth - coords.y,
        y: coords.x
    };
}
/**
 * Rotates multiple coordinates 90 degrees counter-clockwise
 */
export function rotatePlayerCoordinates90CCW(playersWithCoords, originalWidth, originalHeight) {
    return playersWithCoords.map(({ player, coordinates }) => ({
        player,
        coordinates: rotateCoordinates90CCW(coordinates, originalWidth, originalHeight)
    }));
}
