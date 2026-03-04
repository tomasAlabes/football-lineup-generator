import { test, expect } from '@playwright/test';
import { waitForLineupRendered } from './helpers';

test.describe('Player positioning', () => {

  /**
   * Helper: get all player positions grouped by position name for a given team.
   */
  function getPositionsByRole(page: import('@playwright/test').Page, team: 'home' | 'away') {
    return page.evaluate((t) => {
      const renderer = (window as any).currentRenderer;
      const players: Array<{ player: any; coordinates: { x: number; y: number }; isHomeTeam: boolean }> =
        renderer.getAllPlayerPositions();

      const isHome = t === 'home';
      const teamPlayers = players.filter(p => p.isHomeTeam === isHome && p.player.position !== 'substitute');

      const grouped: Record<string, Array<{ x: number; y: number; name: string }>> = {};
      for (const p of teamPlayers) {
        const pos = p.player.position as string;
        if (!grouped[pos]) grouped[pos] = [];
        grouped[pos].push({ ...p.coordinates, name: p.player.player.name });
      }
      return grouped;
    }, team);
  }

  async function selectFormationAndLayout(page: import('@playwright/test').Page, formation: string, layout: string) {
    await page.evaluate((f) => (window as any).loadFormation(f), formation);
    await page.selectOption('#layoutType', layout);
    await page.check('#interactiveMode');
    await page.click('button:has-text("Generate Lineup")');
    await waitForLineupRendered(page);
  }

  test.describe('half pitch - midfield positioning', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/example.html');
      await waitForLineupRendered(page);
    });

    test('4-3-3: DM and CMs form a triangle (different X values)', async ({ page }) => {
      await selectFormationAndLayout(page, '4-3-3', 'half_pitch');
      const positions = await getPositionsByRole(page, 'home');

      const dm = positions['defensive_midfielder'];
      const cm = positions['center_midfielder'];

      expect(dm).toHaveLength(1);
      expect(cm).toHaveLength(2);

      // DM must be at a different X than CMs (triangle, not vertical line)
      const dmX = dm[0].x;
      const cmAvgX = (cm[0].x + cm[1].x) / 2;
      expect(Math.abs(dmX - cmAvgX)).toBeGreaterThan(15);

      // The two CMs should be spread on Y (perpendicular to goal)
      const cmYDiff = Math.abs(cm[0].y - cm[1].y);
      expect(cmYDiff).toBeGreaterThan(20);
    });

    test('4-4-2: two DMs are spread perpendicular to goal (different Y, similar X)', async ({ page }) => {
      await selectFormationAndLayout(page, '4-4-2', 'half_pitch');
      const positions = await getPositionsByRole(page, 'home');

      const dm = positions['defensive_midfielder'];
      expect(dm).toHaveLength(2);

      // Two DMs should be at different Y (spread perpendicular)
      const yDiff = Math.abs(dm[0].y - dm[1].y);
      expect(yDiff).toBeGreaterThan(20);

      // Their X should be similar (same depth line)
      const xDiff = Math.abs(dm[0].x - dm[1].x);
      expect(xDiff).toBeLessThan(yDiff);
    });

    test('4-2-3-1: two DMs are spread perpendicular to goal', async ({ page }) => {
      await selectFormationAndLayout(page, '4-2-3-1', 'half_pitch');
      const positions = await getPositionsByRole(page, 'home');

      const dm = positions['defensive_midfielder'];
      expect(dm).toHaveLength(2);

      const yDiff = Math.abs(dm[0].y - dm[1].y);
      expect(yDiff).toBeGreaterThan(20);
    });

    test('3-5-2: DM, CM, AM at different depths (not same vertical line)', async ({ page }) => {
      await selectFormationAndLayout(page, '3-5-2', 'half_pitch');
      const positions = await getPositionsByRole(page, 'home');

      const dm = positions['defensive_midfielder'];
      const cm = positions['center_midfielder'];
      const am = positions['attacking_midfielder'];

      expect(dm).toHaveLength(1);
      expect(cm).toHaveLength(1);
      expect(am).toHaveLength(1);

      // All three central mids should be at different X depths
      const xs = [dm[0].x, cm[0].x, am[0].x].sort((a, b) => a - b);
      // DM should be deepest (smallest X for home team)
      expect(xs[2] - xs[0]).toBeGreaterThan(20);
    });
  });

  test.describe('half pitch - center back positioning', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/example.html');
      await waitForLineupRendered(page);
    });

    test('4-3-3: two CBs spread perpendicular to goal', async ({ page }) => {
      await selectFormationAndLayout(page, '4-3-3', 'half_pitch');
      const positions = await getPositionsByRole(page, 'home');

      const cb = positions['center_back'];
      expect(cb).toHaveLength(2);

      const yDiff = Math.abs(cb[0].y - cb[1].y);
      expect(yDiff).toBeGreaterThan(20);
    });

    test('3-5-2: three CBs form a line perpendicular to goal', async ({ page }) => {
      await selectFormationAndLayout(page, '3-5-2', 'half_pitch');
      const positions = await getPositionsByRole(page, 'home');

      const cb = positions['center_back'];
      expect(cb).toHaveLength(3);

      // All 3 CBs should have distinct Y positions (spread across the backline)
      const ys = cb.map(c => c.y).sort((a, b) => a - b);
      expect(ys[2] - ys[0]).toBeGreaterThan(40);
    });
  });

  test.describe('half pitch - away team mirrors home team structure', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/example.html');
      await waitForLineupRendered(page);
    });

    test('4-3-3: away team DM and CMs also form a triangle', async ({ page }) => {
      await selectFormationAndLayout(page, '4-3-3', 'half_pitch');
      const positions = await getPositionsByRole(page, 'away');

      const dm = positions['defensive_midfielder'];
      const cm = positions['center_midfielder'];

      expect(dm).toHaveLength(1);
      expect(cm).toHaveLength(2);

      const dmX = dm[0].x;
      const cmAvgX = (cm[0].x + cm[1].x) / 2;
      expect(Math.abs(dmX - cmAvgX)).toBeGreaterThan(15);
    });

    test('away team X coordinates are mirrored (GK far from center, forwards near center)', async ({ page }) => {
      await selectFormationAndLayout(page, '4-3-3', 'half_pitch');

      const homePositions = await getPositionsByRole(page, 'home');
      const awayPositions = await getPositionsByRole(page, 'away');

      const homeGkX = homePositions['goalkeeper'][0].x;
      const homeCfX = homePositions['center_forward'][0].x;
      const awayGkX = awayPositions['goalkeeper'][0].x;
      const awayCfX = awayPositions['center_forward'][0].x;

      // Home: GK on the left (small X), CF on the right (large X)
      expect(homeCfX).toBeGreaterThan(homeGkX);

      // Away: GK on the right (large X), CF on the left (small X) — mirrored
      expect(awayGkX).toBeGreaterThan(awayCfX);

      // Away GK should be further from center than away CF
      // (center of the field is roughly the midpoint between the two halves)
      const fieldCenter = (homeGkX + awayGkX) / 2;
      expect(Math.abs(awayGkX - fieldCenter)).toBeGreaterThan(Math.abs(awayCfX - fieldCenter));
    });
  });
});
