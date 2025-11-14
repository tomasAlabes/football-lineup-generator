import { Position, LayoutType } from '../types.js';
export function calculatePlayerCoordinates(players, width, height, layoutType, fieldOffsetX = 0, isHalfPitch = false, isHomeTeam = true, teamOffsetX = 0, customCoordinates) {
    // Group players by position
    const playersByPosition = new Map();
    for (const player of players) {
        if (!playersByPosition.has(player.position)) {
            playersByPosition.set(player.position, []);
        }
        const positionPlayers = playersByPosition.get(player.position);
        if (positionPlayers) {
            positionPlayers.push(player);
        }
    }
    const result = [];
    // Calculate base coordinates for each position
    for (const [position, positionPlayers] of playersByPosition.entries()) {
        const baseCoords = getBasePositionCoordinates(position, width, height, layoutType, fieldOffsetX, isHalfPitch, isHomeTeam);
        // Apply team offset to base coordinates
        const teamAdjustedCoords = {
            x: baseCoords.x + teamOffsetX,
            y: baseCoords.y
        };
        if (positionPlayers.length === 1) {
            // Single player - check for custom coordinates first
            const player = positionPlayers[0];
            const key = `${player.team}-${player.player.id}`;
            const customCoords = customCoordinates?.get(key);
            result.push({
                player,
                coordinates: customCoords || teamAdjustedCoords
            });
        }
        else {
            // Multiple players - spread them around the team adjusted base position
            for (let index = 0; index < positionPlayers.length; index++) {
                const player = positionPlayers[index];
                // Check for custom coordinates first
                const key = `${player.team}-${player.player.id}`;
                const customCoords = customCoordinates?.get(key);
                const offsetCoords = customCoords || calculatePositionOffset(teamAdjustedCoords, index, positionPlayers.length, position, layoutType);
                result.push({
                    player,
                    coordinates: offsetCoords
                });
            }
        }
    }
    return result;
}
function getBasePositionCoordinates(position, width, height, layoutType, fieldOffsetX, isHalfPitch, isHomeTeam) {
    if (isHalfPitch) {
        return getHalfPitchBaseCoords(position, width, height, isHomeTeam);
    }
    return getFullPitchBaseCoords(position, width, height, layoutType, fieldOffsetX);
}
function getFullPitchBaseCoords(position, width, height, layoutType, fieldOffsetX) {
    const actualWidth = layoutType === LayoutType.SPLIT_PITCH ? width : width;
    const fieldMargin = 50;
    const fieldWidth = actualWidth - 2 * fieldMargin;
    const baseCoords = {
        [Position.GOALKEEPER]: { x: fieldMargin + fieldWidth * 0.08, y: height / 2 },
        [Position.LEFT_BACK]: { x: fieldMargin + fieldWidth * 0.27, y: height * 0.2 },
        [Position.CENTER_BACK]: { x: fieldMargin + fieldWidth * 0.25, y: height * 0.5 },
        [Position.RIGHT_BACK]: { x: fieldMargin + fieldWidth * 0.27, y: height * 0.8 },
        [Position.DEFENSIVE_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.45, y: height / 2 },
        [Position.LEFT_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.6, y: height * 0.2 },
        [Position.CENTER_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.55, y: height / 2 },
        [Position.RIGHT_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.6, y: height * 0.8 },
        [Position.ATTACKING_MIDFIELDER]: { x: fieldMargin + fieldWidth * 0.67, y: height / 2 },
        [Position.LEFT_WINGER]: { x: fieldMargin + fieldWidth * 0.75, y: height * 0.2 },
        [Position.RIGHT_WINGER]: { x: fieldMargin + fieldWidth * 0.75, y: height * 0.8 },
        [Position.LEFT_FORWARD]: { x: fieldMargin + fieldWidth * 0.88, y: height * 0.35 },
        [Position.CENTER_FORWARD]: { x: fieldMargin + fieldWidth * 0.85, y: height / 2 },
        [Position.RIGHT_FORWARD]: { x: fieldMargin + fieldWidth * 0.85, y: height * 0.65 },
        [Position.SUBSTITUTE]: { x: actualWidth + 20, y: height / 2 },
    };
    const coords = baseCoords[position];
    return {
        x: coords.x + fieldOffsetX,
        y: coords.y
    };
}
function getHalfPitchBaseCoords(position, width, height, isHomeTeam) {
    const fieldMargin = 50;
    const fieldWidth = width - 2 * fieldMargin;
    const halfWidth = fieldWidth / 2;
    const baseX = isHomeTeam ? fieldMargin : fieldMargin + halfWidth;
    const baseCoords = {
        [Position.GOALKEEPER]: { x: baseX + halfWidth * 0.15, y: height / 2 },
        [Position.LEFT_BACK]: { x: baseX + halfWidth * 0.4, y: height * 0.15 },
        [Position.CENTER_BACK]: { x: baseX + halfWidth * 0.4, y: height * 0.5 },
        [Position.RIGHT_BACK]: { x: baseX + halfWidth * 0.4, y: height * 0.85 },
        [Position.DEFENSIVE_MIDFIELDER]: { x: baseX + halfWidth * 0.6, y: height * 0.35 },
        [Position.LEFT_MIDFIELDER]: { x: baseX + halfWidth * 0.75, y: height * 0.2 },
        [Position.CENTER_MIDFIELDER]: { x: baseX + halfWidth * 0.6, y: height * 0.65 },
        [Position.RIGHT_MIDFIELDER]: { x: baseX + halfWidth * 0.75, y: height * 0.8 },
        [Position.ATTACKING_MIDFIELDER]: { x: baseX + halfWidth * 0.85, y: height * 0.5 },
        [Position.LEFT_WINGER]: { x: baseX + halfWidth * 0.9, y: height * 0.15 },
        [Position.RIGHT_WINGER]: { x: baseX + halfWidth * 0.9, y: height * 0.85 },
        [Position.LEFT_FORWARD]: { x: baseX + halfWidth * 0.95, y: height * 0.35 },
        [Position.CENTER_FORWARD]: { x: baseX + halfWidth * 0.95, y: height * 0.5 },
        [Position.RIGHT_FORWARD]: { x: baseX + halfWidth * 0.95, y: height * 0.65 },
        [Position.SUBSTITUTE]: { x: width + 20, y: height / 2 },
    };
    return baseCoords[position];
}
function calculatePositionOffset(baseCoords, playerIndex, totalPlayers, position, layoutType) {
    // Increased offset distance for better separation
    const baseOffsetDistance = 35; // Increased from 25
    // Additional offset for same-position players to prevent label overlap
    const labelOffsetMultiplier = totalPlayers > 1 ? 1.5 : 1;
    const offsetDistance = baseOffsetDistance * labelOffsetMultiplier;
    if (totalPlayers === 2) {
        // For 2 players, place them with larger separation
        const offset = playerIndex === 0 ? -offsetDistance / 1.5 : offsetDistance / 1.5;
        // Layout-aware offset direction
        if (layoutType === LayoutType.SPLIT_PITCH) {
            // For split pitch, prefer horizontal offset to avoid field edge issues
            return { x: baseCoords.x + offset, y: baseCoords.y };
        }
        // Determine offset direction based on position for other layouts
        if (isVerticalPosition(position)) {
            return { x: baseCoords.x, y: baseCoords.y + offset };
        }
        return { x: baseCoords.x + offset, y: baseCoords.y };
    }
    if (totalPlayers === 3) {
        // For 3 players, create a wider triangle formation
        const triangleOffsets = [
            { x: 0, y: 0 }, // Left vertex (original position)
            { x: offsetDistance / 3, y: -offsetDistance * 2 }, // Right top vertex
            { x: offsetDistance / 3, y: offsetDistance * 2 } // Right bottom vertex
        ];
        return {
            x: baseCoords.x + triangleOffsets[playerIndex].x,
            y: baseCoords.y + triangleOffsets[playerIndex].y
        };
    }
    // For more than 3 players, create a wider grid
    const cols = Math.ceil(Math.sqrt(totalPlayers));
    const rows = Math.ceil(totalPlayers / cols);
    const col = playerIndex % cols;
    const row = Math.floor(playerIndex / cols);
    const xOffset = (col - (cols - 1) / 2) * (offsetDistance / 1.2); // Wider spacing
    const yOffset = (row - (rows - 1) / 2) * (offsetDistance / 1.2);
    return {
        x: baseCoords.x + xOffset,
        y: baseCoords.y + yOffset
    };
}
function isVerticalPosition(position) {
    // Positions that should be offset vertically when there are multiple players
    return [
        Position.CENTER_BACK,
        Position.DEFENSIVE_MIDFIELDER,
        Position.CENTER_MIDFIELDER,
        Position.ATTACKING_MIDFIELDER,
        Position.CENTER_FORWARD
    ].includes(position);
}
