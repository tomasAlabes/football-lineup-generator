import { Position, LayoutType } from '../types.js';
export function getPositionCoordinates(width, height, layoutType, fieldOffsetX = 0, isFullField = true) {
    const actualWidth = layoutType === LayoutType.SPLIT_PITCH ? width : width;
    const fieldMargin = 50;
    const fieldWidth = actualWidth - 2 * fieldMargin;
    // Improved spacing to reduce overlaps
    const baseCoords = {
        // Goalkeeper
        [Position.GOALKEEPER]: { x: fieldMargin + fieldWidth * 0.08, y: height / 2 },
        // Defenders - better vertical spacing
        [Position.LEFT_BACK]: { x: fieldMargin + fieldWidth * 0.25, y: height * 0.2 },
        [Position.CENTER_BACK]: { x: fieldMargin + fieldWidth * 0.25, y: height * 0.5 },
        [Position.RIGHT_BACK]: { x: fieldMargin + fieldWidth * 0.25, y: height * 0.8 },
        // Defensive Midfielders
        [Position.DEFENSIVE_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.4, y: height / 2 },
        // Midfielders - improved spacing
        [Position.LEFT_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.55, y: height * 0.25 },
        [Position.CENTER_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.55, y: height / 2 },
        [Position.RIGHT_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.55, y: height * 0.75 },
        [Position.ATTACKING_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.7, y: height / 2 },
        // Wingers
        [Position.LEFT_WINGER]: { x: fieldMargin + fieldWidth * 0.75, y: height * 0.2 },
        [Position.RIGHT_WINGER]: { x: fieldMargin + fieldWidth * 0.75, y: height * 0.8 },
        // Forwards - better spacing
        [Position.LEFT_FORWARD]: { x: fieldMargin + fieldWidth * 0.88, y: height * 0.35 },
        [Position.CENTER_FORWARD]: { x: fieldMargin + fieldWidth * 0.88, y: height / 2 },
        [Position.RIGHT_FORWARD]: { x: fieldMargin + fieldWidth * 0.88, y: height * 0.65 },
        // Substitutes (off-field)
        [Position.SUBSTITUTE]: { x: actualWidth + 20, y: height / 2 },
    };
    // Apply field offset for split pitch layout
    const offsetCoords = {};
    for (const [position, coords] of Object.entries(baseCoords)) {
        offsetCoords[position] = {
            x: coords.x + fieldOffsetX,
            y: coords.y
        };
    }
    return offsetCoords;
}
