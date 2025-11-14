import { test, expect, Page } from '@playwright/test';

// Helper to wait for lineup to be rendered
async function waitForLineupRendered(page: Page) {
  await page.waitForSelector('canvas', { timeout: 5000 });
  // Wait a bit for rendering to complete
  await page.waitForTimeout(1000);
}

// Helper to find a player circle on the canvas
async function getPlayerPosition(page: Page, playerName: string): Promise<{ x: number, y: number } | null> {
  return await page.evaluate((name) => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return null;

    // This is a simplified approach - in reality we'd need to parse the canvas
    // For now, we'll rely on the canvas bounding rect and known positions
    const rect = canvas.getBoundingClientRect();

    // Try to find player by checking rendered coordinates
    // This is a placeholder - we'd need to actually render and check
    return { x: rect.left + 100, y: rect.top + 100 };
  }, playerName);
}

test.describe('Interactive Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/example.html');
    await waitForLineupRendered(page);
  });

  test('should enable interactive mode when checkbox is checked', async ({ page }) => {
    // Check the interactive mode checkbox
    await page.check('#interactiveMode');

    // Generate lineup
    await page.click('button:has-text("Generate Lineup")');
    await waitForLineupRendered(page);

    // Verify interactive info is displayed
    const interactiveInfo = page.locator('#interactive-info');
    await expect(interactiveInfo).toBeVisible();
  });

  test('half pitch - home team player drag and drop', async ({ page }) => {
    // Select half pitch layout
    await page.selectOption('#layoutType', 'half_pitch');

    // Enable interactive mode
    await page.check('#interactiveMode');

    // Generate lineup
    await page.click('button:has-text("Generate Lineup")');
    await waitForLineupRendered(page);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Find a player in the home team area (left half)
    // For half pitch, home team should be on the left side
    const initialX = box.x + box.width * 0.25; // 25% from left (home side)
    const initialY = box.y + box.height * 0.5; // Middle height

    // Drag to a new position (still in home half)
    const targetX = box.x + box.width * 0.35;
    const targetY = box.y + box.height * 0.6;

    // Perform drag
    await page.mouse.move(initialX, initialY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY);
    await page.mouse.up();

    // Check if last move was updated
    const lastMove = page.locator('#last-move');
    await expect(lastMove).not.toHaveText('No players moved yet...');
  });

  test('full pitch - home team player drag and drop', async ({ page }) => {
    // Select full pitch layout
    await page.selectOption('#layoutType', 'full_pitch');

    // Enable interactive mode
    await page.check('#interactiveMode');

    // Generate lineup
    await page.click('button:has-text("Generate Lineup")');
    await waitForLineupRendered(page);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Home team is on the left in full pitch
    const initialX = box.x + box.width * 0.2;
    const initialY = box.y + box.height * 0.5;

    const targetX = box.x + box.width * 0.3;
    const targetY = box.y + box.height * 0.6;

    await page.mouse.move(initialX, initialY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY);
    await page.mouse.up();

    const lastMove = page.locator('#last-move');
    await expect(lastMove).not.toHaveText('No players moved yet...');
  });

  test('full pitch - away team player drag and drop', async ({ page }) => {
    // Select full pitch layout
    await page.selectOption('#layoutType', 'full_pitch');

    // Enable interactive mode
    await page.check('#interactiveMode');

    // Generate lineup
    await page.click('button:has-text("Generate Lineup")');
    await waitForLineupRendered(page);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Away team is on the right in full pitch (mirrored)
    const initialX = box.x + box.width * 0.8;
    const initialY = box.y + box.height * 0.5;

    const targetX = box.x + box.width * 0.7;
    const targetY = box.y + box.height * 0.6;

    await page.mouse.move(initialX, initialY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY);
    await page.mouse.up();

    const lastMove = page.locator('#last-move');
    await expect(lastMove).not.toHaveText('No players moved yet...');
  });

  test('split pitch - home team player drag and drop', async ({ page }) => {
    // Select split pitch layout
    await page.selectOption('#layoutType', 'split_pitch');

    // Enable interactive mode
    await page.check('#interactiveMode');

    // Generate lineup
    await page.click('button:has-text("Generate Lineup")');
    await waitForLineupRendered(page);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // In split pitch, home team is on the left rotated pitch
    const initialX = box.x + box.width * 0.25; // Left pitch
    const initialY = box.y + box.height * 0.5;

    const targetX = box.x + box.width * 0.3;
    const targetY = box.y + box.height * 0.6;

    await page.mouse.move(initialX, initialY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY);
    await page.mouse.up();

    const lastMove = page.locator('#last-move');
    await expect(lastMove).not.toHaveText('No players moved yet...');
  });

  test('split pitch - away team player drag and drop', async ({ page }) => {
    // Select split pitch layout
    await page.selectOption('#layoutType', 'split_pitch');

    // Enable interactive mode
    await page.check('#interactiveMode');

    // Generate lineup
    await page.click('button:has-text("Generate Lineup")');
    await waitForLineupRendered(page);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // In split pitch, away team is on the right rotated pitch
    const initialX = box.x + box.width * 0.75; // Right pitch
    const initialY = box.y + box.height * 0.5;

    const targetX = box.x + box.width * 0.7;
    const targetY = box.y + box.height * 0.6;

    await page.mouse.move(initialX, initialY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY);
    await page.mouse.up();

    const lastMove = page.locator('#last-move');
    await expect(lastMove).not.toHaveText('No players moved yet...');
  });

  test('player should follow cursor during drag', async ({ page }) => {
    // Enable interactive mode
    await page.check('#interactiveMode');

    // Generate lineup
    await page.click('button:has-text("Generate Lineup")');
    await waitForLineupRendered(page);

    // Get initial canvas rendering
    const initialCanvas = await page.locator('canvas').screenshot();

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const initialX = box.x + box.width * 0.2;
    const initialY = box.y + box.height * 0.5;

    // Start drag
    await page.mouse.move(initialX, initialY);
    await page.mouse.down();

    // Move to intermediate position
    const midX = box.x + box.width * 0.3;
    const midY = box.y + box.height * 0.6;
    await page.mouse.move(midX, midY);

    // Canvas should have changed during drag
    const midCanvas = await page.locator('canvas').screenshot();
    expect(initialCanvas).not.toEqual(midCanvas);

    await page.mouse.up();
  });
});
