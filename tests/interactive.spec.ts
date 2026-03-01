import { test, expect } from '@playwright/test';
import { waitForLineupRendered, enableInteractiveAndGenerate, getPlayerScreenPos, dragPlayer } from './helpers';

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

  test('half pitch - away team player drag and drop', async ({ page }) => {
    await enableInteractiveAndGenerate(page, 'half_pitch');
    const pos = await getPlayerScreenPos(page, 'away');
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
