export function drawPlayer(ctx, player, coordinates, isHomeTeam, homeTeamColor, awayTeamColor, playerCircleSize, showJerseyNumbers, showPlayerNames, fontSize, allPlayerCoordinates = [], shouldPlaceLabelAbove = false) {
    const { x, y } = coordinates;
    const color = isHomeTeam ? homeTeamColor : awayTeamColor;
    const radius = playerCircleSize;
    // Draw player circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    // Add border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Draw jersey number with larger font
    if (showJerseyNumbers && player.player.jerseyNumber) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize + 2}px Arial`; // Increased font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.player.jerseyNumber.toString(), x, y);
    }
    // Draw player name with badge-style background and improved positioning
    if (showPlayerNames && player.player.name) {
        const labelFontSize = fontSize + 2; // Increased font size
        ctx.font = `${labelFontSize}px Arial`; // Removed bold styling
        ctx.textAlign = 'center';
        // Measure text to determine badge size
        const textMetrics = ctx.measureText(player.player.name);
        const textWidth = textMetrics.width;
        const textHeight = labelFontSize;
        // Badge dimensions with padding
        const badgePadding = 4;
        const badgeWidth = textWidth + (badgePadding * 2);
        const badgeHeight = textHeight + (badgePadding * 2);
        const borderRadius = 4;
        // Determine label position based on shouldPlaceLabelAbove flag
        let badgeY;
        let textY;
        if (shouldPlaceLabelAbove) {
            badgeY = y - radius - 8 - badgeHeight;
            textY = badgeY + badgeHeight / 2;
        }
        else {
            badgeY = y + radius + 8;
            textY = badgeY + badgeHeight / 2;
        }
        const badgeX = x - badgeWidth / 2;
        // Draw badge background with rounded corners and transparency
        ctx.save();
        ctx.globalAlpha = 0.5; // 50% transparency
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, borderRadius);
        ctx.fill();
        ctx.restore();
        // Draw text on top of badge
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.player.name, x, textY);
    }
}
