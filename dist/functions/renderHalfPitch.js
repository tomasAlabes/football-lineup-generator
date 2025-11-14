import { Position } from '../types.js';
import { drawField } from './drawField.js';
import { drawTeamLabel } from './drawTeamLabel.js';
import { calculatePlayerCoordinates } from './calculatePlayerCoordinates.js';
import { calculateLabelPositions } from './calculateLabelPositions.js';
import { drawPlayer } from './drawPlayer.js';
import { drawSubstitutesList } from './drawSubstitutesList.js';
export function renderHalfPitch(ctx, lineupData, config, customCoordinates) {
    // Draw field
    drawField(ctx, config.width, config.height, config.fieldColor, config.lineColor);
    // Draw team labels
    drawTeamLabel(ctx, lineupData.homeTeam.name, true, config.width, config.homeTeamColor, config.awayTeamColor, config.fontSize);
    drawTeamLabel(ctx, lineupData.awayTeam.name, false, config.width, config.homeTeamColor, config.awayTeamColor, config.fontSize);
    // Calculate coordinates for home team players (left half, exclude substitutes)
    const homeFieldPlayers = lineupData.homeTeam.players.filter(p => p.position !== Position.SUBSTITUTE);
    const homePlayerCoords = calculatePlayerCoordinates(homeFieldPlayers, config.width, config.height, config.layoutType, 0, true, true, 0, customCoordinates);
    // Calculate coordinates for away team players (right half, exclude substitutes)
    const awayFieldPlayers = lineupData.awayTeam.players.filter(p => p.position !== Position.SUBSTITUTE);
    const awayPlayerCoords = calculatePlayerCoordinates(awayFieldPlayers, config.width, config.height, config.layoutType, 0, true, false, 0, customCoordinates);
    // Calculate smart label positions with cross-team proximity analysis
    const allPlayersWithCoords = [...homePlayerCoords, ...awayPlayerCoords];
    const playersWithLabelPositions = calculateLabelPositions(allPlayersWithCoords, allPlayersWithCoords);
    // Draw home team players (left half)
    for (const playerWithLabel of playersWithLabelPositions) {
        const isHomePlayer = homePlayerCoords.some(hp => hp.player === playerWithLabel.player);
        if (isHomePlayer) {
            drawPlayer(ctx, playerWithLabel.player, playerWithLabel.coordinates, true, config.homeTeamColor, config.awayTeamColor, config.playerCircleSize, config.showJerseyNumbers, config.showPlayerNames, config.fontSize, allPlayersWithCoords, playerWithLabel.shouldPlaceLabelAbove);
        }
    }
    // Draw away team players (right half)
    for (const playerWithLabel of playersWithLabelPositions) {
        const isAwayPlayer = awayPlayerCoords.some(ap => ap.player === playerWithLabel.player);
        if (isAwayPlayer) {
            drawPlayer(ctx, playerWithLabel.player, playerWithLabel.coordinates, false, config.homeTeamColor, config.awayTeamColor, config.playerCircleSize, config.showJerseyNumbers, config.showPlayerNames, config.fontSize, allPlayersWithCoords, playerWithLabel.shouldPlaceLabelAbove);
        }
    }
    // Draw substitutes list if enabled
    if (config.showSubstitutes.enabled) {
        drawSubstitutesList(ctx, lineupData, config.width, config.height, config.homeTeamColor, config.awayTeamColor, config.fontSize, config.showSubstitutes.position);
    }
    // Return all player coordinates for interactive controller
    return [
        ...homePlayerCoords.map(pc => ({ ...pc, isHomeTeam: true })),
        ...awayPlayerCoords.map(pc => ({ ...pc, isHomeTeam: false }))
    ];
}
