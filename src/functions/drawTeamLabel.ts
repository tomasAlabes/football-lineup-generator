export function drawTeamLabel(
  ctx: CanvasRenderingContext2D,
  teamName: string,
  isHomeTeam: boolean,
  width: number,
  homeTeamColor: string,
  awayTeamColor: string,
  fontSize: number,
  offsetX = 0
): void {
  const x = (isHomeTeam ? 70 : width - 70) + offsetX;
  const y = 30;

  ctx.fillStyle = isHomeTeam ? homeTeamColor : awayTeamColor;
  ctx.font = `bold ${fontSize + 4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(teamName, x, y);
} 