import { FootballLineupRenderer } from './renderer.js';
import { Team, Position, LayoutType } from './types.js';
// Football Lineup Generator - Main entry point for creating lineup visualizations
/**
 * Creates a canvas element with a football lineup visualization
 * @param lineupData The lineup data containing both teams' player positions
 * @param config Optional configuration for the visualization
 * @returns HTMLCanvasElement that can be added to the DOM
 */
export function generateLineup(lineupData, config = {}) {
    // Create canvas element
    const canvas = document.createElement('canvas');
    // Initialize renderer
    const renderer = new FootballLineupRenderer(canvas, config);
    // Render the lineup
    renderer.render(lineupData);
    return canvas;
}
/**
 * Convenience function to create a lineup from positioning data (backend format)
 * @param positioningData Array of positioning data from backend
 * @param homeTeamName Name of the home team
 * @param awayTeamName Name of the away team
 * @param config Optional configuration for the visualization
 * @returns HTMLCanvasElement that can be added to the DOM
 */
export function generateLineupFromPositioning(positioningData, homeTeamName, awayTeamName, config = {}) {
    // Group players by team
    const homeTeamPlayers = [];
    const awayTeamPlayers = [];
    for (const positioning of positioningData) {
        const playerPositioning = {
            player: {
                id: positioning.player_id,
                name: positioning.player_name,
                jerseyNumber: positioning.jersey_number,
            },
            team: positioning.team,
            position: positioning.position,
        };
        if (positioning.team === Team.RED) {
            homeTeamPlayers.push(playerPositioning);
        }
        else {
            awayTeamPlayers.push(playerPositioning);
        }
    }
    const lineupData = {
        matchId: positioningData[0]?.match_id,
        homeTeam: {
            name: homeTeamName,
            players: homeTeamPlayers,
        },
        awayTeam: {
            name: awayTeamName,
            players: awayTeamPlayers,
        },
    };
    return generateLineup(lineupData, config);
}
// Export types and enums for external use
export { Team, Position, LayoutType };
export { FootballLineupRenderer };
// Export default
export default {
    generateLineup,
    generateLineupFromPositioning,
    Team,
    Position,
    LayoutType,
    FootballLineupRenderer,
};
