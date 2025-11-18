/**
 * Draws a football/soccer ball on the canvas
 */
export function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 10,
  color: string = '#FFFFFF'
): void {
  ctx.save();

  // Draw ball circle
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw pentagon pattern on the ball
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;

  // Draw a simple pentagon in the center
  const pentagonSize = size * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = x + pentagonSize * Math.cos(angle);
    const py = y + pentagonSize * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = '#000000';
  ctx.fill();

  ctx.restore();
}
