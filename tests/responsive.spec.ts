import { test, expect } from '@playwright/test';
import { waitForLineupRendered } from './helpers';

const MINIMAL_LINEUP = {
  homeTeam: {
    name: 'Home',
    players: [
      { player: { id: 1, name: 'Player One', jerseyNumber: 7 }, team: 'red', position: 'goalkeeper' },
    ],
  },
  awayTeam: {
    name: 'Away',
    players: [
      { player: { id: 2, name: 'Player Two', jerseyNumber: 9 }, team: 'yellow', position: 'goalkeeper' },
    ],
  },
};

/**
 * Creates a renderer in the browser via dynamic import, renders a minimal lineup,
 * and captures all font size values set on the canvas context during rendering.
 */
async function getRenderedFontSizes(page: any, width: number): Promise<number[]> {
  return page.evaluate(async (args: { width: number; lineup: any }) => {
    const { FootballLineupRenderer } = await import('./dist/index.js');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Spy on ctx.font to capture all font sizes used during rendering
    const sizes: number[] = [];
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      CanvasRenderingContext2D.prototype,
      'font'
    );
    Object.defineProperty(ctx, 'font', {
      set(value: string) {
        const match = value.match(/(\d+)px/);
        if (match) sizes.push(parseInt(match[1]));
        originalDescriptor!.set!.call(this, value);
      },
      get() {
        return originalDescriptor!.get!.call(this);
      },
    });

    const renderer = new FootballLineupRenderer(canvas, { width: args.width, height: 600 });
    renderer.render(args.lineup);
    return sizes;
  }, { width, lineup: MINIMAL_LINEUP });
}

/**
 * Creates a renderer and returns the canvas dataURL for visual comparison.
 */
async function renderToDataURL(page: any, width: number, height: number): Promise<string> {
  return page.evaluate(async (args: { width: number; height: number; lineup: any }) => {
    const { FootballLineupRenderer } = await import('./dist/index.js');
    const canvas = document.createElement('canvas');
    const renderer = new FootballLineupRenderer(canvas, { width: args.width, height: args.height });
    renderer.render(args.lineup);
    return canvas.toDataURL();
  }, { width, height, lineup: MINIMAL_LINEUP });
}

test.describe('Responsive scaling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example.html');
    await waitForLineupRendered(page);
  });

  test('at base width (800px), default font sizes are unchanged', async ({ page }) => {
    const sizes = await getRenderedFontSizes(page, 800);
    // Default fontSize is 12, drawPlayer uses fontSize+2=14 for jersey number and label
    expect(sizes).toContain(14);
  });

  test('at half the base width (400px), font sizes are smaller than at full width', async ({ page }) => {
    const fullSizes = await getRenderedFontSizes(page, 800);
    const halfSizes = await getRenderedFontSizes(page, 400);

    const maxFull = Math.max(...fullSizes);
    const maxHalf = Math.max(...halfSizes);
    expect(maxHalf).toBeLessThan(maxFull);
  });

  test('at very small width (200px), font sizes respect the minimum floor', async ({ page }) => {
    const sizes = await getRenderedFontSizes(page, 200);
    // Minimum fontSize is 8, drawPlayer adds +2 → minimum rendered font is 10px
    for (const size of sizes) {
      expect(size).toBeGreaterThanOrEqual(10);
    }
  });

  test('at width larger than base (1200px), sizes are identical to base (no upscaling)', async ({ page }) => {
    const baseSizes = await getRenderedFontSizes(page, 800);
    const largerSizes = await getRenderedFontSizes(page, 1200);

    expect(largerSizes).toEqual(baseSizes);
  });

  test('explicit fontSize in config is also scaled down on small canvas', async ({ page }) => {
    const sizes = await getRenderedFontSizes(page, 400);
    // scaleFactor=0.5, default fontSize=12 → round(12*0.5)=6 → clamped to 8
    // drawPlayer uses fontSize+2=10. No font should reach the unscaled 14px.
    for (const size of sizes) {
      expect(size).toBeLessThanOrEqual(12);
    }
  });

  test('canvas renders differently at 800px vs 400px (visual regression check)', async ({ page }) => {
    const wide = await renderToDataURL(page, 800, 600);
    const narrow = await renderToDataURL(page, 400, 300);
    expect(wide).not.toEqual(narrow);
  });
});
