import { test, expect } from '@playwright/test';
import { waitForLineupRendered } from './helpers';

// Ball requires both interactive mode and ball enabled, since getBallPosition()
// is accessed through InteractiveController, which only exists when interactive: true.
async function enableBallAndGenerate(page: any) {
  await page.check('#interactiveMode');
  await page.check('#showBall');
  await page.click('button:has-text("Generate Lineup")');
  await waitForLineupRendered(page);
}

async function getBallScreenPos(page: any): Promise<{ x: number; y: number }> {
  await page.locator('canvas').scrollIntoViewIfNeeded();
  return page.evaluate(() => {
    const renderer = (window as any).currentRenderer;
    const ballPos = renderer.getBallPosition();
    if (!ballPos) throw new Error('Ball position not found');

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    return {
      x: rect.left + ballPos.x * scaleX,
      y: rect.top + ballPos.y * scaleY,
    };
  });
}

test.describe('Ball Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example.html');
    await waitForLineupRendered(page);
  });

  test.describe('getBallPosition()', () => {
    test('returns null when ball rendering is not enabled', async ({ page }) => {
      // Interactive mode enabled but ball not enabled
      await page.check('#interactiveMode');
      await page.click('button:has-text("Generate Lineup")');
      await waitForLineupRendered(page);

      const ballPos = await page.evaluate(() =>
        (window as any).currentRenderer.getBallPosition()
      );
      expect(ballPos).toBeNull();
    });

    test('ball is not rendered on canvas when showBall is not enabled', async ({ page }) => {
      // Generate with interactive mode only (no ball)
      await page.check('#interactiveMode');
      await page.click('button:has-text("Generate Lineup")');
      await waitForLineupRendered(page);
      const withoutBall = await page.locator('canvas').screenshot();

      // Now enable ball and regenerate
      await page.check('#showBall');
      await page.click('button:has-text("Generate Lineup")');
      await waitForLineupRendered(page);
      const withBall = await page.locator('canvas').screenshot();

      // The canvas should look different once a ball is added
      expect(withoutBall).not.toEqual(withBall);
    });

    test('returns a position object when ball is enabled', async ({ page }) => {
      await enableBallAndGenerate(page);

      const ballPos = await page.evaluate(() =>
        (window as any).currentRenderer.getBallPosition()
      );
      expect(ballPos).not.toBeNull();
      expect(typeof ballPos.x).toBe('number');
      expect(typeof ballPos.y).toBe('number');
    });

    test('defaults to roughly the center of the canvas', async ({ page }) => {
      await enableBallAndGenerate(page);

      const result = await page.evaluate(() => {
        const renderer = (window as any).currentRenderer;
        const ballPos = renderer.getBallPosition();
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        return {
          ballX: ballPos.x,
          ballY: ballPos.y,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
        };
      });

      // Ball should start at canvas center (within 20% margin)
      expect(result.ballX).toBeGreaterThan(result.canvasWidth * 0.3);
      expect(result.ballX).toBeLessThan(result.canvasWidth * 0.7);
      expect(result.ballY).toBeGreaterThan(result.canvasHeight * 0.3);
      expect(result.ballY).toBeLessThan(result.canvasHeight * 0.7);
    });
  });

  test.describe('setBallPosition()', () => {
    test('moves the ball to the specified coordinates', async ({ page }) => {
      await enableBallAndGenerate(page);

      await page.evaluate(() =>
        (window as any).currentRenderer.setBallPosition(100, 150)
      );

      const ballPos = await page.evaluate(() =>
        (window as any).currentRenderer.getBallPosition()
      );
      expect(ballPos.x).toBeCloseTo(100, 0);
      expect(ballPos.y).toBeCloseTo(150, 0);
    });

    test('re-renders the canvas when called', async ({ page }) => {
      await enableBallAndGenerate(page);

      const before = await page.locator('canvas').screenshot();

      await page.evaluate(() =>
        (window as any).currentRenderer.setBallPosition(50, 50)
      );

      const after = await page.locator('canvas').screenshot();
      expect(before).not.toEqual(after);
    });
  });

  test.describe('ball drag', () => {
    test('ball can be dragged to a new position', async ({ page }) => {
      await enableBallAndGenerate(page);

      const ballPos = await getBallScreenPos(page);
      const initialCanvasPos = await page.evaluate(() =>
        (window as any).currentRenderer.getBallPosition()
      );

      await page.mouse.move(ballPos.x, ballPos.y);
      await page.mouse.down();
      await page.mouse.move(ballPos.x + 80, ballPos.y + 80, { steps: 10 });
      await page.mouse.up();

      const newCanvasPos = await page.evaluate(() =>
        (window as any).currentRenderer.getBallPosition()
      );
      expect(newCanvasPos.x).not.toBeCloseTo(initialCanvasPos.x, 0);
      expect(newCanvasPos.y).not.toBeCloseTo(initialCanvasPos.y, 0);
    });

    test('canvas updates visually while dragging the ball', async ({ page }) => {
      await enableBallAndGenerate(page);

      const ballPos = await getBallScreenPos(page);
      const beforeDrag = await page.locator('canvas').screenshot();

      await page.mouse.move(ballPos.x, ballPos.y);
      await page.mouse.down();
      await page.mouse.move(ballPos.x + 100, ballPos.y + 100, { steps: 10 });

      const duringDrag = await page.locator('canvas').screenshot();
      expect(beforeDrag).not.toEqual(duringDrag);

      await page.mouse.up();
    });
  });
});
