export function drawField(ctx, width, height, fieldColor, lineColor, offsetX = 0, isFullField = true) {
    const fieldMargin = 50;
    const fieldWidth = width - 2 * fieldMargin;
    const fieldHeight = height - 2 * fieldMargin;
    // Draw solid color background
    ctx.fillStyle = fieldColor;
    ctx.fillRect(fieldMargin + offsetX, fieldMargin, fieldWidth, fieldHeight);
    // Field lines
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    // Outer boundary
    ctx.strokeRect(fieldMargin + offsetX, fieldMargin, fieldWidth, fieldHeight);
    if (isFullField) {
        // Center line
        ctx.beginPath();
        ctx.moveTo(width / 2 + offsetX, fieldMargin);
        ctx.lineTo(width / 2 + offsetX, height - fieldMargin);
        ctx.stroke();
        // Center circle
        ctx.beginPath();
        ctx.arc(width / 2 + offsetX, height / 2, 50, 0, 2 * Math.PI);
        ctx.stroke();
    }
    // Penalty areas
    const penaltyWidth = 80;
    const penaltyHeight = 120;
    const goalAreaWidth = 30;
    const goalAreaHeight = 60;
    // Left penalty area
    ctx.strokeRect(fieldMargin + offsetX, height / 2 - penaltyHeight / 2, penaltyWidth, penaltyHeight);
    // Left goal area
    ctx.strokeRect(fieldMargin + offsetX, height / 2 - goalAreaHeight / 2, goalAreaWidth, goalAreaHeight);
    // Right penalty area
    ctx.strokeRect(width - fieldMargin - penaltyWidth + offsetX, height / 2 - penaltyHeight / 2, penaltyWidth, penaltyHeight);
    // Right goal area
    ctx.strokeRect(width - fieldMargin - goalAreaWidth + offsetX, height / 2 - goalAreaHeight / 2, goalAreaWidth, goalAreaHeight);
    // Goals
    const goalWidth = 8;
    const goalHeight = 24;
    // Left goal
    ctx.strokeRect(fieldMargin - goalWidth + offsetX, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    // Right goal
    ctx.strokeRect(width - fieldMargin + offsetX, height / 2 - goalHeight / 2, goalWidth, goalHeight);
}
