import { test, expect } from '@playwright/test';
import { waitForLineupRendered } from './helpers';

async function generateLineup(page: any, layoutType?: string) {
  if (layoutType) {
    await page.selectOption('#layoutType', layoutType);
  }
  await page.click('button:has-text("Generate Lineup")');
  await waitForLineupRendered(page);
}

async function getCanvasDimensions(page: any) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    return { width: canvas.width, height: canvas.height };
  });
}

async function hasRenderingError(page: any): Promise<boolean> {
  return page.evaluate(() => {
    const display = document.getElementById('lineup-display');
    return display ? display.innerText.includes('Error generating lineup') : false;
  });
}

test.describe('Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example.html');
    await waitForLineupRendered(page);
  });

  test.describe('canvas output', () => {
    test('renders a canvas element on page load', async ({ page }) => {
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('canvas has non-zero dimensions after generation', async ({ page }) => {
      await generateLineup(page);
      const dims = await getCanvasDimensions(page);
      expect(dims.width).toBeGreaterThan(0);
      expect(dims.height).toBeGreaterThan(0);
    });

    test('no rendering error message appears for default lineup', async ({ page }) => {
      await generateLineup(page);
      expect(await hasRenderingError(page)).toBe(false);
    });
  });

  test.describe('canvas dimensions per layout', () => {
    // Default canvas size in example.html is 1000x700
    test('full_pitch uses configured width and height', async ({ page }) => {
      await generateLineup(page, 'full_pitch');
      const dims = await getCanvasDimensions(page);
      expect(dims.width).toBe(1000);
      expect(dims.height).toBe(700);
    });

    test('half_pitch uses configured width and height', async ({ page }) => {
      await generateLineup(page, 'half_pitch');
      const dims = await getCanvasDimensions(page);
      expect(dims.width).toBe(1000);
      expect(dims.height).toBe(700);
    });

    test('split_pitch is wider than a single pitch (two pitches side-by-side)', async ({ page }) => {
      await generateLineup(page, 'full_pitch');
      const fullPitchDims = await getCanvasDimensions(page);

      await generateLineup(page, 'split_pitch');
      const splitPitchDims = await getCanvasDimensions(page);

      // Split pitch: width = height*2 + 60, height = original width
      expect(splitPitchDims.width).toBeGreaterThan(fullPitchDims.width);
    });

    test('split_pitch canvas width equals height*2 + 60', async ({ page }) => {
      await page.selectOption('#canvasSize', '1000x700');
      await generateLineup(page, 'split_pitch');
      const dims = await getCanvasDimensions(page);
      // width = 700*2 + 60, height = 1000
      expect(dims.width).toBe(700 * 2 + 60);
      expect(dims.height).toBe(1000);
    });
  });

  test.describe('formations', () => {
    const formations = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'] as const;

    for (const formation of formations) {
      test(`${formation} renders without error`, async ({ page }) => {
        await page.click(`button:has-text("${formation}")`);
        await generateLineup(page);
        expect(await hasRenderingError(page)).toBe(false);
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
      });
    }

    test('switching formations updates the canvas', async ({ page }) => {
      await page.click('button:has-text("4-3-3")');
      await generateLineup(page);
      const snapshot433 = await page.locator('canvas').screenshot();

      await page.click('button:has-text("4-4-2")');
      await generateLineup(page);
      const snapshot442 = await page.locator('canvas').screenshot();

      expect(snapshot433).not.toEqual(snapshot442);
    });
  });

  test.describe('team labels', () => {
    test('home team name appears in the player list', async ({ page }) => {
      await generateLineup(page);
      await expect(page.locator('.home-team h3')).toContainText('Arsenal');
    });

    test('away team name appears in the player list', async ({ page }) => {
      await generateLineup(page);
      await expect(page.locator('.away-team h3')).toContainText('Chelsea');
    });

    test('custom team names are reflected in the player list', async ({ page }) => {
      await page.fill('#homeTeam', 'Liverpool');
      await page.fill('#awayTeam', 'ManCity');
      await generateLineup(page);
      await expect(page.locator('.home-team h3')).toContainText('Liverpool');
      await expect(page.locator('.away-team h3')).toContainText('ManCity');
    });
  });

  test.describe('canvas appearance across layouts', () => {
    test('each layout type produces a different canvas rendering', async ({ page }) => {
      await generateLineup(page, 'full_pitch');
      const fullPitch = await page.locator('canvas').screenshot();

      await generateLineup(page, 'half_pitch');
      const halfPitch = await page.locator('canvas').screenshot();

      await generateLineup(page, 'split_pitch');
      const splitPitch = await page.locator('canvas').screenshot();

      expect(fullPitch).not.toEqual(halfPitch);
      expect(fullPitch).not.toEqual(splitPitch);
      expect(halfPitch).not.toEqual(splitPitch);
    });
  });
});
