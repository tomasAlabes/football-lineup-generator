export function drawTeamLabel(ctx, teamName, isHomeTeam, width, homeTeamColor, awayTeamColor, fontSize, offsetX = 0) {
    const x = (isHomeTeam ? 70 : width - 70) + offsetX;
    const y = 30;
    ctx.fillStyle = isHomeTeam ? homeTeamColor : awayTeamColor;
    ctx.font = `bold ${fontSize + 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(teamName, x, y);
}
