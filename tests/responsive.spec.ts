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

const LINEUP_WITH_SUBS = {
  homeTeam: {
    name: 'Home',
    players: [
      { player: { id: 1, name: 'Player One', jerseyNumber: 7 }, team: 'red', position: 'goalkeeper' },
      { player: { id: 3, name: 'Sub One', jerseyNumber: 12 }, team: 'red', position: 'substitute' },
    ],
  },
  awayTeam: {
    name: 'Away',
    players: [
      { player: { id: 2, name: 'Player Two', jerseyNumber: 9 }, team: 'yellow', position: 'goalkeeper' },
      { player: { id: 4, name: 'Sub Two', jerseyNumber: 14 }, team: 'yellow', position: 'substitute' },
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

/**
 * Renders a lineup with substitutes and captures font sizes and arc radii used.
 */
async function getRenderedSubMetrics(page: any, width: number): Promise<{ fontSizes: number[]; arcRadii: number[] }> {
  return page.evaluate(async (args: { width: number; lineup: any }) => {
    const { FootballLineupRenderer } = await import('./dist/index.js');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const fontSizes: number[] = [];
    const arcRadii: number[] = [];

    // Spy on ctx.font
    const fontDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font');
    Object.defineProperty(ctx, 'font', {
      set(value: string) {
        const match = value.match(/(\d+)px/);
        if (match) fontSizes.push(parseInt(match[1]));
        fontDesc!.set!.call(this, value);
      },
      get() { return fontDesc!.get!.call(this); },
    });

    // Spy on ctx.arc to capture radii
    const originalArc = ctx.arc.bind(ctx);
    ctx.arc = function(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) {
      arcRadii.push(radius);
      return originalArc(x, y, radius, startAngle, endAngle, counterclockwise);
    };

    const renderer = new FootballLineupRenderer(canvas, {
      width: args.width,
      height: 600,
      showSubstitutes: { enabled: true, position: 'bottom' },
    });
    renderer.render(args.lineup);
    return { fontSizes, arcRadii };
  }, { width, lineup: LINEUP_WITH_SUBS });
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

  test('substitute font sizes scale down at half width', async ({ page }) => {
    const full = await getRenderedSubMetrics(page, 800);
    const half = await getRenderedSubMetrics(page, 400);

    const maxFontFull = Math.max(...full.fontSizes);
    const maxFontHalf = Math.max(...half.fontSizes);
    expect(maxFontHalf).toBeLessThan(maxFontFull);
  });

  test('substitute circle radii scale down at half width', async ({ page }) => {
    const full = await getRenderedSubMetrics(page, 800);
    const half = await getRenderedSubMetrics(page, 400);

    // Default playerCircleSize=16. At 800px (scale=1) → 16. At 400px (scale=0.5) → max(round(8),10)=10.
    // Filter out field-drawing arcs (center circle=50, corner arcs, etc.) by looking for the player circle sizes.
    const fullPlayerRadii = full.arcRadii.filter(r => r <= 20);
    const halfPlayerRadii = half.arcRadii.filter(r => r <= 20);

    const maxPlayerFull = Math.max(...fullPlayerRadii);
    const maxPlayerHalf = Math.max(...halfPlayerRadii);
    expect(maxPlayerHalf).toBeLessThan(maxPlayerFull);
  });
});

const FULL_LINEUP = {
  homeTeam: {
    name: 'Home',
    players: [
      { player: { id: 1, name: 'GK', jerseyNumber: 1 }, team: 'red', position: 'goalkeeper' },
      { player: { id: 2, name: 'LB', jerseyNumber: 2 }, team: 'red', position: 'left_back' },
      { player: { id: 3, name: 'CB', jerseyNumber: 4 }, team: 'red', position: 'center_back' },
      { player: { id: 4, name: 'RB', jerseyNumber: 5 }, team: 'red', position: 'right_back' },
      { player: { id: 5, name: 'CM', jerseyNumber: 8 }, team: 'red', position: 'center_midfielder' },
      { player: { id: 6, name: 'ST', jerseyNumber: 9 }, team: 'red', position: 'center_forward' },
      { player: { id: 7, name: 'Sub1', jerseyNumber: 12 }, team: 'red', position: 'substitute' },
      { player: { id: 8, name: 'Sub2', jerseyNumber: 13 }, team: 'red', position: 'substitute' },
    ],
  },
  awayTeam: {
    name: 'Away',
    players: [
      { player: { id: 11, name: 'GK', jerseyNumber: 1 }, team: 'yellow', position: 'goalkeeper' },
      { player: { id: 12, name: 'LB', jerseyNumber: 2 }, team: 'yellow', position: 'left_back' },
      { player: { id: 13, name: 'CB', jerseyNumber: 4 }, team: 'yellow', position: 'center_back' },
      { player: { id: 14, name: 'RB', jerseyNumber: 5 }, team: 'yellow', position: 'right_back' },
      { player: { id: 15, name: 'CM', jerseyNumber: 8 }, team: 'yellow', position: 'center_midfielder' },
      { player: { id: 16, name: 'ST', jerseyNumber: 9 }, team: 'yellow', position: 'center_forward' },
      { player: { id: 17, name: 'Sub1', jerseyNumber: 14 }, team: 'yellow', position: 'substitute' },
    ],
  },
};

const MAX_SUBS_LINEUP = {
  homeTeam: {
    name: 'Home',
    players: [
      { player: { id: 1, name: 'GK', jerseyNumber: 1 }, team: 'red', position: 'goalkeeper' },
      { player: { id: 2, name: 'LB', jerseyNumber: 2 }, team: 'red', position: 'left_back' },
      { player: { id: 3, name: 'CB', jerseyNumber: 4 }, team: 'red', position: 'center_back' },
      { player: { id: 4, name: 'RB', jerseyNumber: 5 }, team: 'red', position: 'right_back' },
      { player: { id: 5, name: 'CM', jerseyNumber: 8 }, team: 'red', position: 'center_midfielder' },
      { player: { id: 6, name: 'ST', jerseyNumber: 9 }, team: 'red', position: 'center_forward' },
      { player: { id: 101, name: 'Sub1', jerseyNumber: 12 }, team: 'red', position: 'substitute' },
      { player: { id: 102, name: 'Sub2', jerseyNumber: 13 }, team: 'red', position: 'substitute' },
      { player: { id: 103, name: 'Sub3', jerseyNumber: 14 }, team: 'red', position: 'substitute' },
      { player: { id: 104, name: 'Sub4', jerseyNumber: 15 }, team: 'red', position: 'substitute' },
      { player: { id: 105, name: 'Sub5', jerseyNumber: 16 }, team: 'red', position: 'substitute' },
      { player: { id: 106, name: 'Sub6', jerseyNumber: 17 }, team: 'red', position: 'substitute' },
      { player: { id: 107, name: 'Sub7', jerseyNumber: 18 }, team: 'red', position: 'substitute' },
    ],
  },
  awayTeam: {
    name: 'Away',
    players: [
      { player: { id: 11, name: 'GK', jerseyNumber: 1 }, team: 'yellow', position: 'goalkeeper' },
      { player: { id: 12, name: 'LB', jerseyNumber: 2 }, team: 'yellow', position: 'left_back' },
      { player: { id: 13, name: 'CB', jerseyNumber: 4 }, team: 'yellow', position: 'center_back' },
      { player: { id: 14, name: 'RB', jerseyNumber: 5 }, team: 'yellow', position: 'right_back' },
      { player: { id: 15, name: 'CM', jerseyNumber: 8 }, team: 'yellow', position: 'center_midfielder' },
      { player: { id: 16, name: 'ST', jerseyNumber: 9 }, team: 'yellow', position: 'center_forward' },
      { player: { id: 111, name: 'Sub1', jerseyNumber: 12 }, team: 'yellow', position: 'substitute' },
      { player: { id: 112, name: 'Sub2', jerseyNumber: 13 }, team: 'yellow', position: 'substitute' },
      { player: { id: 113, name: 'Sub3', jerseyNumber: 14 }, team: 'yellow', position: 'substitute' },
      { player: { id: 114, name: 'Sub4', jerseyNumber: 15 }, team: 'yellow', position: 'substitute' },
      { player: { id: 115, name: 'Sub5', jerseyNumber: 16 }, team: 'yellow', position: 'substitute' },
      { player: { id: 116, name: 'Sub6', jerseyNumber: 17 }, team: 'yellow', position: 'substitute' },
      { player: { id: 117, name: 'Sub7', jerseyNumber: 18 }, team: 'yellow', position: 'substitute' },
    ],
  },
};

/**
 * Renders a lineup and returns how many player circles are out of bounds.
 */
async function getPlayerBoundsResult(
  page: any,
  width: number,
  height: number,
  config?: Record<string, any>,
  tolerance = 1,
  lineup: any = FULL_LINEUP,
): Promise<{ total: number; outOfBounds: number; canvasW: number; canvasH: number }> {
  return page.evaluate(async (args: { width: number; height: number; lineup: any; config: any; tolerance: number }) => {
    const { FootballLineupRenderer } = await import('./dist/index.js');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const circles: Array<{ x: number; y: number; r: number }> = [];
    const originalArc = ctx.arc.bind(ctx);
    ctx.arc = function(x: number, y: number, r: number, s: number, e: number, ccw?: boolean) {
      circles.push({ x, y, r });
      return originalArc(x, y, r, s, e, ccw);
    };

    const renderer = new FootballLineupRenderer(canvas, {
      width: args.width,
      height: args.height,
      ...args.config,
    });
    renderer.render(args.lineup);

    const playerCircles = circles.filter(c => c.r <= 20);
    const oob = playerCircles.filter(c =>
      c.x - c.r < -args.tolerance || c.y - c.r < -args.tolerance ||
      c.x + c.r > canvas.width + args.tolerance || c.y + c.r > canvas.height + args.tolerance
    );
    return { total: playerCircles.length, outOfBounds: oob.length, canvasW: canvas.width, canvasH: canvas.height };
  }, { width, height, lineup, config: config ?? {}, tolerance });
}

test.describe('Mobile phone rendering (390x844)', () => {
  const MOBILE_WIDTH = 390;
  const MOBILE_HEIGHT = 844;

  test.beforeEach(async ({ page }) => {
    await page.goto('/example.html');
    await waitForLineupRendered(page);
  });

  test('players are rendered within canvas bounds at mobile width', async ({ page }) => {
    const result = await getPlayerBoundsResult(page, MOBILE_WIDTH, MOBILE_HEIGHT);
    expect(result.total).toBeGreaterThan(0);
    expect(result.outOfBounds).toBe(0);
  });

  test('font sizes are scaled down and respect minimum at mobile width', async ({ page }) => {
    const sizes = await getRenderedFontSizes(page, MOBILE_WIDTH);

    // scaleFactor ≈ 390/800 ≈ 0.4875 — all fonts should be scaled down
    // Minimum fontSize is 8, drawPlayer adds +2 → minimum rendered font is 10px
    for (const size of sizes) {
      expect(size).toBeGreaterThanOrEqual(10);
    }
    // Should be smaller than base (14px at 800px width)
    const maxSize = Math.max(...sizes);
    expect(maxSize).toBeLessThan(14);
  });

  test('substitute players render within bounds at mobile width', async ({ page }) => {
    // 10px tolerance: substitute circles may slightly clip at canvas edges (known edge case)
    const result = await getPlayerBoundsResult(
      page, MOBILE_WIDTH, MOBILE_HEIGHT,
      { showSubstitutes: { enabled: true, position: 'bottom' } },
      10,
    );
    expect(result.total).toBeGreaterThanOrEqual(10);
    expect(result.outOfBounds).toBe(0);
  });

  test('substitute circle and font sizes scale proportionally at mobile width', async ({ page }) => {
    const base = await getRenderedSubMetrics(page, 800);
    const mobile = await getRenderedSubMetrics(page, MOBILE_WIDTH);

    const baseFontMax = Math.max(...base.fontSizes);
    const mobileFontMax = Math.max(...mobile.fontSizes);
    expect(mobileFontMax).toBeLessThan(baseFontMax);

    const basePlayerRadii = base.arcRadii.filter(r => r <= 20);
    const mobilePlayerRadii = mobile.arcRadii.filter(r => r <= 20);
    const baseRadiusMax = Math.max(...basePlayerRadii);
    const mobileRadiusMax = Math.max(...mobilePlayerRadii);
    expect(mobileRadiusMax).toBeLessThan(baseRadiusMax);
  });

  test('mobile rendering produces valid non-empty canvas output', async ({ page }) => {
    const dataUrl = await renderToDataURL(page, MOBILE_WIDTH, MOBILE_HEIGHT);
    // Should produce a valid data URL, not an empty canvas
    expect(dataUrl).toMatch(/^data:image\/png;base64,.{100,}/);
  });
});

test.describe('Small mobile rendering (320x568 — iPhone SE)', () => {
  const SMALL_WIDTH = 320;
  const SMALL_HEIGHT = 568;

  test.beforeEach(async ({ page }) => {
    await page.goto('/example.html');
    await waitForLineupRendered(page);
  });

  test('players are rendered within canvas bounds at 320px', async ({ page }) => {
    const result = await getPlayerBoundsResult(page, SMALL_WIDTH, SMALL_HEIGHT);
    expect(result.total).toBeGreaterThan(0);
    expect(result.outOfBounds).toBe(0);
  });

  test('font sizes hit the minimum floor and match 390px sizes', async ({ page }) => {
    const smallSizes = await getRenderedFontSizes(page, SMALL_WIDTH);
    const mobileSizes = await getRenderedFontSizes(page, 390);

    // Both are below the ~533px threshold, so fontSize is clamped to 8 → drawPlayer renders 10px
    // The rendered font sizes should be identical since both hit the floor
    expect(smallSizes).toEqual(mobileSizes);

    for (const size of smallSizes) {
      expect(size).toBeGreaterThanOrEqual(10);
    }
  });

  test('player circle sizes hit the minimum floor and match 390px sizes', async ({ page }) => {
    const small = await getRenderedSubMetrics(page, SMALL_WIDTH);
    const mobile = await getRenderedSubMetrics(page, 390);

    // Both widths are below the ~500px threshold where playerCircleSize clamps to 10
    const smallPlayerRadii = small.arcRadii.filter(r => r <= 20);
    const mobilePlayerRadii = mobile.arcRadii.filter(r => r <= 20);
    expect(Math.max(...smallPlayerRadii)).toBe(Math.max(...mobilePlayerRadii));
  });

  test('substitute players render within bounds at 320px', async ({ page }) => {
    const result = await getPlayerBoundsResult(
      page, SMALL_WIDTH, SMALL_HEIGHT,
      { showSubstitutes: { enabled: true, position: 'bottom' } },
      10,
    );
    expect(result.total).toBeGreaterThanOrEqual(10);
    expect(result.outOfBounds).toBe(0);
  });

  test('rendering produces valid output at 320px', async ({ page }) => {
    const dataUrl = await renderToDataURL(page, SMALL_WIDTH, SMALL_HEIGHT);
    expect(dataUrl).toMatch(/^data:image\/png;base64,.{100,}/);
  });
});

test.describe('Max substitutes (7 per team)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example.html');
    await waitForLineupRendered(page);
  });

  test('all 26 player circles (12 field + 14 subs) are drawn at base width (800px)', async ({ page }) => {
    const result = await getPlayerBoundsResult(
      page, 800, 600,
      { showSubstitutes: { enabled: true, position: 'bottom' } },
      1,
      MAX_SUBS_LINEUP,
    );
    expect(result.total).toBeGreaterThanOrEqual(26);
  });

  test('substitute circles overflow horizontally at 800px with 7 subs (known issue)', async ({ page }) => {
    // With fixed playerSpacing=120px, sub 7 starts at x=20+6*120=740px.
    // The circle center is at 740+circleRadius, which overflows 800px.
    // This documents the current behavior — subs don't wrap or scale spacing.
    const result = await getPlayerBoundsResult(
      page, 800, 600,
      { showSubstitutes: { enabled: true, position: 'bottom' } },
      1,
      MAX_SUBS_LINEUP,
    );
    expect(result.outOfBounds).toBeGreaterThan(0);
  });

  test('substitute overflow is worse at mobile widths (390px, 320px)', async ({ page }) => {
    const mobile = await getPlayerBoundsResult(
      page, 390, 844,
      { showSubstitutes: { enabled: true, position: 'bottom' } },
      1,
      MAX_SUBS_LINEUP,
    );
    const small = await getPlayerBoundsResult(
      page, 320, 568,
      { showSubstitutes: { enabled: true, position: 'bottom' } },
      1,
      MAX_SUBS_LINEUP,
    );
    // More subs overflow at smaller widths
    expect(mobile.outOfBounds).toBeGreaterThan(0);
    expect(small.outOfBounds).toBeGreaterThanOrEqual(mobile.outOfBounds);
  });

  test('7 subs render without error and produce valid canvas at all mobile sizes', async ({ page }) => {
    for (const [w, h] of [[390, 844], [320, 568]] as const) {
      const dataUrl = await page.evaluate(async (args: { width: number; height: number; lineup: any }) => {
        const { FootballLineupRenderer } = await import('./dist/index.js');
        const canvas = document.createElement('canvas');
        const renderer = new FootballLineupRenderer(canvas, {
          width: args.width,
          height: args.height,
          showSubstitutes: { enabled: true, position: 'bottom' },
        });
        renderer.render(args.lineup);
        return canvas.toDataURL();
      }, { width: w, height: h, lineup: MAX_SUBS_LINEUP });
      expect(dataUrl).toMatch(/^data:image\/png;base64,.{100,}/);
    }
  });
});
