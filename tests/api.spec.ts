import { test, expect } from '@playwright/test';
import { waitForLineupRendered, enableInteractiveAndGenerate, getPlayerScreenPos, dragPlayer } from './helpers';

test.describe('Renderer API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example.html');
    await waitForLineupRendered(page);
    await enableInteractiveAndGenerate(page);
  });

  test.describe('getAllPlayerPositions()', () => {
    test('returns all players after render', async ({ page }) => {
      const count = await page.evaluate(() =>
        (window as any).currentRenderer.getAllPlayerPositions().length
      );
      expect(count).toBeGreaterThan(0);
    });

    test('contains both home and away players', async ({ page }) => {
      const result = await page.evaluate(() => {
        const players = (window as any).currentRenderer.getAllPlayerPositions();
        return {
          hasHome: players.some((p: any) => p.isHomeTeam === true),
          hasAway: players.some((p: any) => p.isHomeTeam === false),
        };
      });
      expect(result.hasHome).toBe(true);
      expect(result.hasAway).toBe(true);
    });

    test('returns valid numeric coordinates for all players', async ({ page }) => {
      const allValid = await page.evaluate(() => {
        const players = (window as any).currentRenderer.getAllPlayerPositions();
        return players.every(
          (p: any) =>
            typeof p.coordinates.x === 'number' &&
            typeof p.coordinates.y === 'number' &&
            !isNaN(p.coordinates.x) &&
            !isNaN(p.coordinates.y)
        );
      });
      expect(allValid).toBe(true);
    });

    test('includes player id, name, and position for each entry', async ({ page }) => {
      const allHaveData = await page.evaluate(() => {
        const players = (window as any).currentRenderer.getAllPlayerPositions();
        return players.every(
          (p: any) =>
            typeof p.player.player.id === 'number' &&
            typeof p.player.player.name === 'string' &&
            typeof p.player.position === 'string'
        );
      });
      expect(allHaveData).toBe(true);
    });
  });

  test.describe('getCustomCoordinates()', () => {
    test('is empty before any drag', async ({ page }) => {
      const size = await page.evaluate(() => {
        const map = (window as any).currentRenderer.getCustomCoordinates();
        return map ? map.size : 0;
      });
      expect(size).toBe(0);
    });

    test('grows by one entry after a player drag', async ({ page }) => {
      const pos = await getPlayerScreenPos(page, 'home');
      await dragPlayer(page, pos);

      const size = await page.evaluate(() => {
        const map = (window as any).currentRenderer.getCustomCoordinates();
        return map ? map.size : 0;
      });
      expect(size).toBeGreaterThan(0);
    });
  });

  test.describe('clearCustomCoordinates()', () => {
    test('resets all custom positions to zero', async ({ page }) => {
      const pos = await getPlayerScreenPos(page, 'home');
      await dragPlayer(page, pos);

      // Confirm something was stored
      const beforeSize = await page.evaluate(() => {
        const map = (window as any).currentRenderer.getCustomCoordinates();
        return map ? map.size : 0;
      });
      expect(beforeSize).toBeGreaterThan(0);

      // Clear and verify
      await page.evaluate(() => (window as any).currentRenderer.clearCustomCoordinates());

      const afterSize = await page.evaluate(() => {
        const map = (window as any).currentRenderer.getCustomCoordinates();
        return map ? map.size : 0;
      });
      expect(afterSize).toBe(0);
    });

    test('causes the canvas to re-render to formation positions', async ({ page }) => {
      const pos = await getPlayerScreenPos(page, 'home');
      await dragPlayer(page, pos);

      const snapshotAfterDrag = await page.locator('canvas').screenshot();

      await page.evaluate(() => (window as any).currentRenderer.clearCustomCoordinates());
      await page.waitForTimeout(100);

      const snapshotAfterClear = await page.locator('canvas').screenshot();
      expect(snapshotAfterDrag).not.toEqual(snapshotAfterClear);
    });
  });

  test.describe('setCustomCoordinate()', () => {
    test('moves a player to the specified coordinates', async ({ page }) => {
      const playerInfo = await page.evaluate(() => {
        const players = (window as any).currentRenderer.getAllPlayerPositions();
        const fieldPlayer = players.find((p: any) => p.player.position !== 'substitute');
        if (!fieldPlayer) return null;
        return { id: fieldPlayer.player.player.id, team: fieldPlayer.player.team };
      });
      expect(playerInfo).not.toBeNull();

      const targetX = 200;
      const targetY = 200;

      await page.evaluate(
        ({ id, team, x, y }) => (window as any).currentRenderer.setCustomCoordinate(id, team, x, y),
        { id: playerInfo!.id, team: playerInfo!.team, x: targetX, y: targetY }
      );

      const newCoords = await page.evaluate(({ id, team }) => {
        const players = (window as any).currentRenderer.getAllPlayerPositions();
        const found = players.find(
          (p: any) => p.player.player.id === id && p.player.team === team
        );
        return found ? found.coordinates : null;
      }, { id: playerInfo!.id, team: playerInfo!.team });

      expect(newCoords).not.toBeNull();
      expect(newCoords!.x).toBeCloseTo(targetX, 0);
      expect(newCoords!.y).toBeCloseTo(targetY, 0);
    });

    test('updates the canvas when called', async ({ page }) => {
      const playerInfo = await page.evaluate(() => {
        const players = (window as any).currentRenderer.getAllPlayerPositions();
        const fieldPlayer = players.find((p: any) => p.player.position !== 'substitute');
        if (!fieldPlayer) return null;
        return { id: fieldPlayer.player.player.id, team: fieldPlayer.player.team };
      });
      expect(playerInfo).not.toBeNull();

      const before = await page.locator('canvas').screenshot();

      await page.evaluate(
        ({ id, team }) => (window as any).currentRenderer.setCustomCoordinate(id, team, 50, 50),
        { id: playerInfo!.id, team: playerInfo!.team }
      );

      const after = await page.locator('canvas').screenshot();
      expect(before).not.toEqual(after);
    });
  });
});
