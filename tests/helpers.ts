import { type Page } from '@playwright/test';

export async function waitForLineupRendered(page: Page) {
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(500);
}

export async function enableInteractiveAndGenerate(page: Page, layoutType?: string) {
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
export async function getPlayerScreenPos(
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

export async function dragPlayer(page: Page, from: { x: number; y: number }, offset = 50) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + offset, from.y + offset, { steps: 10 });
  await page.mouse.up();
}
