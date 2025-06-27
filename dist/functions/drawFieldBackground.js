export function drawFieldBackground(ctx, width, height, fieldColor, backgroundImageLoaded, offsetX = 0) {
    const fieldMargin = 50;
    const fieldWidth = width - 2 * fieldMargin;
    const fieldHeight = height - 2 * fieldMargin;
    // Draw background image if available, otherwise use solid color
    if (backgroundImageLoaded) {
        // Draw the background image to fit the field area
        ctx.drawImage(backgroundImageLoaded, fieldMargin + offsetX, fieldMargin, fieldWidth, fieldHeight);
    }
    else {
        // Draw solid color background
        ctx.fillStyle = fieldColor;
        ctx.fillRect(fieldMargin + offsetX, fieldMargin, fieldWidth, fieldHeight);
    }
}
