export function drawTeamLabelRotated90CCW(ctx, teamName, isHomeTeam, width, height, homeTeamColor, awayTeamColor, fontSize, offsetX = 0) {
    ctx.save();
    // Translate to the center of the rotation area for side-by-side layout
    ctx.translate(offsetX + height, 0);
    // Rotate 90 degrees counter-clockwise
    ctx.rotate(-Math.PI / 2);
    // Draw team label in rotated coordinate system
    const x = isHomeTeam ? 70 : width - 70;
    const y = 30;
    ctx.fillStyle = isHomeTeam ? homeTeamColor : awayTeamColor;
    ctx.font = `bold ${fontSize + 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(teamName, x, y);
    ctx.restore();
}
