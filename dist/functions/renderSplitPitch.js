import { Position } from '../types.js';
import { drawFieldRotated90CCW } from './drawFieldRotated.js';
import { drawTeamLabelRotated90CCW } from './drawTeamLabelRotated.js';
import { calculatePlayerCoordinates } from './calculatePlayerCoordinates.js';
import { calculateLabelPositions } from './calculateLabelPositions.js';
import { rotatePlayerCoordinates90CCW } from './rotateCoordinates.js';
import { drawPlayer } from './drawPlayer.js';
import { drawSubstitutesSplit } from './drawSubstitutesSplit.js';
export function renderSplitPitch(ctx, lineupData, config) {
    const gap = 60; // Gap between the two separate fields
    // Draw FIRST ROTATED FIELD for home team (left side)
    drawFieldRotated90CCW(ctx, config.width, config.height, config.fieldColor, config.lineColor, 0, true);
    drawTeamLabelRotated90CCW(ctx, lineupData.homeTeam.name, true, config.width, config.height, config.homeTeamColor, config.awayTeamColor, config.fontSize, 0);
    // Draw SECOND ROTATED FIELD for away team (right side)
    drawFieldRotated90CCW(ctx, config.width, config.height, config.fieldColor, config.lineColor, config.height + gap, true);
    drawTeamLabelRotated90CCW(ctx, lineupData.awayTeam.name, false, config.width, config.height, config.homeTeamColor, config.awayTeamColor, config.fontSize, config.height + gap);
    // Calculate coordinates for home team players (first field, exclude substitutes)
    const homeFieldPlayers = lineupData.homeTeam.players.filter(p => p.position !== Position.SUBSTITUTE);
    const homePlayerCoordsOriginal = calculatePlayerCoordinates(homeFieldPlayers, config.width, config.height, config.layoutType, 0, false, true);
    // Calculate coordinates for away team players (second field, exclude substitutes)
    const awayFieldPlayers = lineupData.awayTeam.players.filter(p => p.position !== Position.SUBSTITUTE);
    const awayPlayerCoordsOriginal = calculatePlayerCoordinates(awayFieldPlayers, config.width, config.height, config.layoutType, 0, // No offset since we'll handle positioning with rotation
    false, true);
    // Rotate coordinates for both teams
    const homePlayerCoords = rotatePlayerCoordinates90CCW(homePlayerCoordsOriginal, config.width, config.height);
    const awayPlayerCoords = rotatePlayerCoordinates90CCW(awayPlayerCoordsOriginal, config.width, config.height).map(({ player, coordinates }) => ({
        player,
        coordinates: {
            x: coordinates.x + config.height + gap, // Offset for second field (side by side)
            y: coordinates.y
        }
    }));
    // Calculate smart label positions for each team separately (since they're on different rotated fields)
    const homePlayersWithLabelPositions = calculateLabelPositions(homePlayerCoords);
    const awayPlayersWithLabelPositions = calculateLabelPositions(awayPlayerCoords);
    // Draw home team players on FIRST rotated field (left side)
    for (const playerWithLabel of homePlayersWithLabelPositions) {
        drawPlayer(ctx, playerWithLabel.player, playerWithLabel.coordinates, true, config.homeTeamColor, config.awayTeamColor, config.playerCircleSize, config.showJerseyNumbers, config.showPlayerNames, config.fontSize, homePlayerCoords, playerWithLabel.shouldPlaceLabelAbove);
    }
    // Draw away team players on SECOND rotated field (right side)
    for (const playerWithLabel of awayPlayersWithLabelPositions) {
        drawPlayer(ctx, playerWithLabel.player, playerWithLabel.coordinates, false, config.homeTeamColor, config.awayTeamColor, config.playerCircleSize, config.showJerseyNumbers, config.showPlayerNames, config.fontSize, awayPlayerCoords, playerWithLabel.shouldPlaceLabelAbove);
    }
    // Draw substitutes if enabled
    if (config.showSubstitutes.enabled) {
        drawSubstitutesSplit(ctx, lineupData, config.height, config.height + gap, config.homeTeamColor, config.awayTeamColor, config.playerCircleSize, config.showJerseyNumbers, config.showPlayerNames, config.fontSize);
    }
}
