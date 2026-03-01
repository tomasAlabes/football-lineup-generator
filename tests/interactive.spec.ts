import { test, expect, Page } from '@playwright/test';

async function waitForLineupRendered(page: Page) {
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(500);
}

async function enableInteractiveAndGenerate(page: Page, layoutType?: string) {
  if (layoutType) {
    await page.selectOption('#layoutType', layoutType);
  }
  await page.check('#interactiveMode');
  await page.click('button:has-text("Generate Lineup")');
  await waitForLineupRendered(page);
}

/**
 * Returns the actual screen position of a player by converting canvas coordinates
 * to page coordinates inside the browser, accounting for CSS scaling (max-width: 100%).
 *
 * @param team - 'home' | 'away' | 'any'
 */
async function getPlayerScreenPos(
  page: Page,
  team: 'home' | 'away' | 'any' = 'any'
): Promise<{ x: number; y: number }> {
  await page.locator('canvas').scrollIntoViewIfNeeded();
  const pos = await page.evaluate((teamFilter) => {
    const renderer = (window as any).currentRenderer;
    if (!renderer) throw new Error('currentRenderer not found on window');

    const players: Array<{ player: any; coordinates: { x: number; y: number }; isHomeTeam: boolean }> =
      renderer.getAllPlayerPositions();

    const field = players.filter(p => p.player.position !== 'substitute');
    const match =
      teamFilter === 'home' ? field.find(p => p.isHomeTeam) :
      teamFilter === 'away' ? field.find(p => !p.isHomeTeam) :
      field[0];

    if (!match) return null;

    // Account for CSS scaling (e.g. max-width: 100%)
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    return {
      x: rect.left + match.coordinates.x * scaleX,
      y: rect.top + match.coordinates.y * scaleY,
    };
  }, team);

  if (!pos) throw new Error(`No ${team} field player found`);
  return pos;
}

async function dragPlayer(page: Page, from: { x: number; y: number }, offset = 50) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + offset, from.y + offset, { steps: 10 });
  await page.mouse.up();
}

test.describe('Interactive Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example.html');
    await waitForLineupRendered(page);
  });

  test('should enable interactive mode when checkbox is checked', async ({ page }) => {
    await enableInteractiveAndGenerate(page);
    await expect(page.locator('#interactive-info')).toBeVisible();
  });

  test('half pitch - home team player drag and drop', async ({ page }) => {
    await enableInteractiveAndGenerate(page, 'half_pitch');
    const pos = await getPlayerScreenPos(page, 'home');
    await dragPlayer(page, pos);
    await expect(page.locator('#last-move')).not.toHaveText('No players moved yet...');
  });

  test('full pitch - home team player drag and drop', async ({ page }) => {
    await enableInteractiveAndGenerate(page, 'full_pitch');
    const pos = await getPlayerScreenPos(page, 'home');
    await dragPlayer(page, pos);
    await expect(page.locator('#last-move')).not.toHaveText('No players moved yet...');
  });

  test('full pitch - away team player drag and drop', async ({ page }) => {
    await enableInteractiveAndGenerate(page, 'full_pitch');
    const pos = await getPlayerScreenPos(page, 'away');
    await dragPlayer(page, pos);
    await expect(page.locator('#last-move')).not.toHaveText('No players moved yet...');
  });

  test('split pitch - home team player drag and drop', async ({ page }) => {
    await enableInteractiveAndGenerate(page, 'split_pitch');
    const pos = await getPlayerScreenPos(page, 'home');
    await dragPlayer(page, pos);
    await expect(page.locator('#last-move')).not.toHaveText('No players moved yet...');
  });

  test('split pitch - away team player drag and drop', async ({ page }) => {
    await enableInteractiveAndGenerate(page, 'split_pitch');
    const pos = await getPlayerScreenPos(page, 'away');
    await dragPlayer(page, pos);
    await expect(page.locator('#last-move')).not.toHaveText('No players moved yet...');
  });

  test('player should follow cursor during drag', async ({ page }) => {
    await enableInteractiveAndGenerate(page);
    const pos = await getPlayerScreenPos(page, 'any');

    const initialSnapshot = await page.locator('canvas').screenshot();

    await page.mouse.move(pos.x, pos.y);
    await page.mouse.down();
    await page.mouse.move(pos.x + 60, pos.y + 60, { steps: 10 });

    const midSnapshot = await page.locator('canvas').screenshot();
    expect(initialSnapshot).not.toEqual(midSnapshot);

    await page.mouse.up();
  });
});
