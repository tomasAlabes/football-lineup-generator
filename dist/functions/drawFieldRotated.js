export function drawFieldRotated90CCW(ctx, width, height, fieldColor, lineColor, offsetX = 0, isFullField = true) {
    ctx.save();
    // -------------------------------------------------------------------------
    // STEP 1: Paint the solid pitch background in the "normal" (un-rotated)
    // coordinate system. For the split-pitch layout the rotated pitch will end
    // up occupying a bounding box of height × width, starting at the horizontal
    // offset that is passed in. Simply filling that rectangle here guarantees
    // the grass colour is present irrespective of the subsequent rotation.
    // -------------------------------------------------------------------------
    ctx.fillStyle = fieldColor;
    ctx.fillRect(offsetX, 0, height, width);
    // -------------------------------------------------------------------------
    // STEP 2: Rotate the drawing context so we can reuse the same line-drawing
    // logic that the standard (non-rotated) field uses.  We translate to the
    // centre of the rotation area first so that, after the 90° CCW rotation, the
    // pitch lines line up perfectly with the background we just drew.
    // -------------------------------------------------------------------------
    ctx.translate(offsetX, width);
    // Rotate 90 degrees counter-clockwise
    ctx.rotate(-Math.PI / 2);
    // Draw the field in the rotated coordinate system
    const fieldMargin = 50;
    const fieldWidth = width - 2 * fieldMargin;
    const fieldHeight = height - 2 * fieldMargin;
    // Field lines
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    // Outer boundary
    ctx.strokeRect(fieldMargin, fieldMargin, fieldWidth, fieldHeight);
    if (isFullField) {
        // Center line
        ctx.beginPath();
        ctx.moveTo(width / 2, fieldMargin);
        ctx.lineTo(width / 2, height - fieldMargin);
        ctx.stroke();
        // Center circle
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 50, 0, 2 * Math.PI);
        ctx.stroke();
    }
    // Penalty areas
    const penaltyWidth = 80;
    const penaltyHeight = 120;
    const goalAreaWidth = 30;
    const goalAreaHeight = 60;
    // Left penalty area
    ctx.strokeRect(fieldMargin, height / 2 - penaltyHeight / 2, penaltyWidth, penaltyHeight);
    // Left goal area
    ctx.strokeRect(fieldMargin, height / 2 - goalAreaHeight / 2, goalAreaWidth, goalAreaHeight);
    // Right penalty area
    ctx.strokeRect(width - fieldMargin - penaltyWidth, height / 2 - penaltyHeight / 2, penaltyWidth, penaltyHeight);
    // Right goal area
    ctx.strokeRect(width - fieldMargin - goalAreaWidth, height / 2 - goalAreaHeight / 2, goalAreaWidth, goalAreaHeight);
    // Goals
    const goalWidth = 8;
    const goalHeight = 24;
    // Left goal
    ctx.strokeRect(fieldMargin - goalWidth, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    // Right goal
    ctx.strokeRect(width - fieldMargin, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    ctx.restore();
}
