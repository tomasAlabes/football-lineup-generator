import type { LineupData } from '../types.js';
import { Position, SubstitutesPosition } from '../types.js';

const PANEL_WIDTH = 180;

export function drawSubstitutesList(
  ctx: CanvasRenderingContext2D,
  lineupData: LineupData,
  width: number,
  height: number,
  homeTeamColor: string,
  awayTeamColor: string,
  fontSize: number,
  position: SubstitutesPosition,
  playerCircleSize: number = 15,
  fontColor: string = '#333333'
): void {
  const circleRadius = playerCircleSize;
  const spacing = 12; // Space between circle and text

  // Get substitutes
  const homeSubs = lineupData.homeTeam.players.filter(p => p.position === Position.SUBSTITUTE);
  const awaySubs = lineupData.awayTeam.players.filter(p => p.position === Position.SUBSTITUTE);

  if (position === SubstitutesPosition.BOTTOM) {
    drawSubstitutesBottom(ctx, homeSubs, awaySubs, height, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing, fontColor);
  } else if (position === SubstitutesPosition.LEFT) {
    drawSubstitutesLeft(ctx, homeSubs, awaySubs, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing, fontColor);
  } else if (position === SubstitutesPosition.RIGHT) {
    drawSubstitutesRight(ctx, homeSubs, awaySubs, width, homeTeamColor, awayTeamColor, fontSize, circleRadius, spacing, fontColor);
  }
}

function drawSubstitutesBottom(
  ctx: CanvasRenderingContext2D,
  homeSubs: any[],
  awaySubs: any[],
  height: number,
  homeTeamColor: string,
  awayTeamColor: string,
  fontSize: number,
  circleRadius: number,
  spacing: number,
  fontColor: string
): void {
  const startY = height + 30;
  const playerSpacing = 120;

  // Draw home team substitutes
  if (homeSubs.length > 0) {
    ctx.fillStyle = fontColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';

    let currentX = 20;
    for (let i = 0; i < homeSubs.length; i++) {
      const player = homeSubs[i];
      const y = startY + 25;
      // In bottom layout, each player gets playerSpacing width
      drawPlayerCircleAndName(ctx, player, currentX, y, homeTeamColor, fontSize, circleRadius, spacing, playerSpacing, fontColor);
      currentX += playerSpacing;
    }
  }

  // Draw away team substitutes
  if (awaySubs.length > 0) {
    const awayStartY = startY + 60;
    ctx.fillStyle = fontColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';

    let currentX = 20;
    for (let i = 0; i < awaySubs.length; i++) {
      const player = awaySubs[i];
      const y = awayStartY + 25;
      drawPlayerCircleAndName(ctx, player, currentX, y, awayTeamColor, fontSize, circleRadius, spacing, playerSpacing, fontColor);
      currentX += playerSpacing;
    }
  }
}

function drawSubstitutesLeft(
  ctx: CanvasRenderingContext2D,
  homeSubs: any[],
  awaySubs: any[],
  homeTeamColor: string,
  awayTeamColor: string,
  fontSize: number,
  circleRadius: number,
  spacing: number,
  fontColor: string
): void {
  const startX = 20;
  let currentY = 100;
  const playerSpacing = 50;

  // Draw home team substitutes
  if (homeSubs.length > 0) {
    ctx.fillStyle = fontColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';
    currentY += 20;

    for (let i = 0; i < homeSubs.length; i++) {
      const player = homeSubs[i];
      drawPlayerCircleAndName(ctx, player, startX, currentY, homeTeamColor, fontSize, circleRadius, spacing, PANEL_WIDTH - startX, fontColor);
      currentY += playerSpacing;
    }
    currentY += 20;
  }

  // Draw away team substitutes
  if (awaySubs.length > 0) {
    ctx.fillStyle = fontColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';
    currentY += 20;

    for (let i = 0; i < awaySubs.length; i++) {
      const player = awaySubs[i];
      drawPlayerCircleAndName(ctx, player, startX, currentY, awayTeamColor, fontSize, circleRadius, spacing, PANEL_WIDTH - startX, fontColor);
      currentY += playerSpacing;
    }
  }
}

function drawSubstitutesRight(
  ctx: CanvasRenderingContext2D,
  homeSubs: any[],
  awaySubs: any[],
  width: number,
  homeTeamColor: string,
  awayTeamColor: string,
  fontSize: number,
  circleRadius: number,
  spacing: number,
  fontColor: string
): void {
  const startX = width + 20;
  let currentY = 100;
  const playerSpacing = 50;

  // Draw home team substitutes
  if (homeSubs.length > 0) {
    ctx.fillStyle = fontColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';
    currentY += 20;

    for (let i = 0; i < homeSubs.length; i++) {
      const player = homeSubs[i];
      drawPlayerCircleAndName(ctx, player, startX, currentY, homeTeamColor, fontSize, circleRadius, spacing, PANEL_WIDTH - 20, fontColor);
      currentY += playerSpacing;
    }
    currentY += 20;
  }

  // Draw away team substitutes
  if (awaySubs.length > 0) {
    ctx.fillStyle = fontColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';
    currentY += 20;

    for (let i = 0; i < awaySubs.length; i++) {
      const player = awaySubs[i];
      drawPlayerCircleAndName(ctx, player, startX, currentY, awayTeamColor, fontSize, circleRadius, spacing, PANEL_WIDTH - 20, fontColor);
      currentY += playerSpacing;
    }
  }
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (maxWidth <= 0) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;

  const ellipsis = '...';
  const ellipsisWidth = ctx.measureText(ellipsis).width;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated).width + ellipsisWidth > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + ellipsis;
}

function drawPlayerCircleAndName(
  ctx: CanvasRenderingContext2D,
  player: any,
  x: number,
  y: number,
  teamColor: string,
  fontSize: number,
  circleRadius: number,
  spacing: number,
  maxTotalWidth: number,
  fontColor: string
): void {
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

  // Draw player name (truncated with ellipsis if too long)
  ctx.fillStyle = fontColor;
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const nameOffset = circleRadius * 2 + spacing;
  const maxNameWidth = maxTotalWidth - nameOffset;
  const name = truncateText(ctx, player.player.name, maxNameWidth);
  ctx.fillText(name, x + nameOffset, y);
}
