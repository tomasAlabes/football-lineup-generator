import { Position } from '../types.js';
export function drawSubstitutesList(ctx, lineupData, height, homeTeamColor, awayTeamColor, fontSize) {
    const startY = height + 30; // Start 30px below the pitch
    const circleRadius = 8;
    const spacing = 15; // Space between circle and text
    const playerSpacing = 120; // Space between each player entry
    // Get substitutes
    const homeSubs = lineupData.homeTeam.players.filter(p => p.position === Position.SUBSTITUTE);
    const awaySubs = lineupData.awayTeam.players.filter(p => p.position === Position.SUBSTITUTE);
    // Draw home team substitutes label
    if (homeSubs.length > 0) {
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText('Home Substitutes:', 20, startY);
    }
    // Draw home team substitutes
    let currentX = 20;
    for (let i = 0; i < homeSubs.length; i++) {
        const player = homeSubs[i];
        const y = startY + 25;
        // Draw circle
        ctx.beginPath();
        ctx.arc(currentX + circleRadius, y, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = homeTeamColor;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw jersey number inside circle
        if (player.player.jerseyNumber) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${fontSize - 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(player.player.jerseyNumber.toString(), currentX + circleRadius, y);
        }
        // Draw player name
        ctx.fillStyle = '#333333';
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.player.name, currentX + circleRadius * 2 + spacing, y);
        currentX += playerSpacing;
    }
    // Draw away team substitutes label
    if (awaySubs.length > 0) {
        const awayStartY = startY + 60;
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('Away Substitutes:', 20, awayStartY);
        // Draw away team substitutes
        currentX = 20;
        for (let i = 0; i < awaySubs.length; i++) {
            const player = awaySubs[i];
            const y = awayStartY + 25;
            // Draw circle
            ctx.beginPath();
            ctx.arc(currentX + circleRadius, y, circleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = awayTeamColor;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Draw jersey number inside circle
            if (player.player.jerseyNumber) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${fontSize - 2}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(player.player.jerseyNumber.toString(), currentX + circleRadius, y);
            }
            // Draw player name
            ctx.fillStyle = '#333333';
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(player.player.name, currentX + circleRadius * 2 + spacing, y);
            currentX += playerSpacing;
        }
    }
}
