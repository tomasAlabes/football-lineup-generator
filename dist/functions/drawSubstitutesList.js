import { Position, SubstitutesPosition } from '../types.js';
export function drawSubstitutesList(ctx, lineupData, width, height, homeTeamColor, awayTeamColor, fontSize, position) {
    const circleRadius = 12;
    const spacing = 15; // Space between circle and text
    // Get substitutes
    const homeSubs = lineupData.homeTeam.players.filter(p => p.position === Position.SUBSTITUTE);
    const awaySubs = lineupData.awayTeam.players.filter(p => p.position === Position.SUBSTITUTE);
    if (position === SubstitutesPosition.BOTTOM) {
        drawSubstitutesBottom(ctx, homeSubs, awaySubs, height, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing);
    }
    else if (position === SubstitutesPosition.LEFT) {
        drawSubstitutesLeft(ctx, homeSubs, awaySubs, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing);
    }
    else if (position === SubstitutesPosition.RIGHT) {
        drawSubstitutesRight(ctx, homeSubs, awaySubs, width, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing);
    }
}
function drawSubstitutesBottom(ctx, homeSubs, awaySubs, height, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing) {
    const startY = height + 30;
    const playerSpacing = 120;
    // Draw home team substitutes
    if (homeSubs.length > 0) {
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('Home Substitutes:', 20, startY);
        let currentX = 20;
        for (let i = 0; i < homeSubs.length; i++) {
            const player = homeSubs[i];
            const y = startY + 25;
            drawPlayerCircleAndName(ctx, player, currentX, y, homeTeamColor, fontSize, circleRadius, spacing);
            currentX += playerSpacing;
        }
    }
    // Draw away team substitutes
    if (awaySubs.length > 0) {
        const awayStartY = startY + 60;
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('Away Substitutes:', 20, awayStartY);
        let currentX = 20;
        for (let i = 0; i < awaySubs.length; i++) {
            const player = awaySubs[i];
            const y = awayStartY + 25;
            drawPlayerCircleAndName(ctx, player, currentX, y, awayTeamColor, fontSize, circleRadius, spacing);
            currentX += playerSpacing;
        }
    }
}
function drawSubstitutesLeft(ctx, homeSubs, awaySubs, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing) {
    const startX = 20;
    let currentY = 100;
    const playerSpacing = 50;
    // Draw home team substitutes
    if (homeSubs.length > 0) {
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('Home', startX, currentY);
        currentY += 20;
        for (let i = 0; i < homeSubs.length; i++) {
            const player = homeSubs[i];
            drawPlayerCircleAndName(ctx, player, startX, currentY, homeTeamColor, fontSize, circleRadius, spacing);
            currentY += playerSpacing;
        }
        currentY += 20;
    }
    // Draw away team substitutes
    if (awaySubs.length > 0) {
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('Away', startX, currentY);
        currentY += 20;
        for (let i = 0; i < awaySubs.length; i++) {
            const player = awaySubs[i];
            drawPlayerCircleAndName(ctx, player, startX, currentY, awayTeamColor, fontSize, circleRadius, spacing);
            currentY += playerSpacing;
        }
    }
}
function drawSubstitutesRight(ctx, homeSubs, awaySubs, width, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing) {
    const startX = width + 20;
    let currentY = 100;
    const playerSpacing = 50;
    // Draw home team substitutes
    if (homeSubs.length > 0) {
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('Home', startX, currentY);
        currentY += 20;
        for (let i = 0; i < homeSubs.length; i++) {
            const player = homeSubs[i];
            drawPlayerCircleAndName(ctx, player, startX, currentY, homeTeamColor, fontSize, circleRadius, spacing);
            currentY += playerSpacing;
        }
        currentY += 20;
    }
    // Draw away team substitutes
    if (awaySubs.length > 0) {
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('Away', startX, currentY);
        currentY += 20;
        for (let i = 0; i < awaySubs.length; i++) {
            const player = awaySubs[i];
            drawPlayerCircleAndName(ctx, player, startX, currentY, awayTeamColor, fontSize, circleRadius, spacing);
            currentY += playerSpacing;
        }
    }
}
function drawPlayerCircleAndName(ctx, player, x, y, teamColor, fontSize, circleRadius, spacing) {
    // Draw circle
    ctx.beginPath();
    ctx.arc(x + circleRadius, y, circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = teamColor;
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
        ctx.fillText(player.player.jerseyNumber.toString(), x + circleRadius, y);
    }
    // Draw player name
    ctx.fillStyle = '#333333';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.player.name, x + circleRadius * 2 + spacing, y);
}
