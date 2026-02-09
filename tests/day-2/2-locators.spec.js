/**
 * DAY 2: Locators - Example
 * - Demonstrates robust locator strategies: roles, hasText, nth, chained locators
 * RUN: npm test -- tests/day-2/2-locators.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 2: Locators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should find navigation links by role and name', async ({ page }) => {
    const forms = page.getByRole('link', { name: 'Forms' });
    await expect(forms).toBeVisible();

    const tables = page.getByRole('link', { name: 'Tables' });
    await expect(tables).toBeVisible();
  });

  test('should locate card by text and inspect children', async ({ page }) => {
    const card = page.locator('.grid .card', { hasText: 'Forms' }).first();
    await expect(card).toBeVisible();

    const heading = card.locator('h3');
    await expect(heading).toHaveText(/Forms/i);
  });

  test('should use chained locators and nth()', async ({ page }) => {
    const cards = page.locator('.grid .card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Inspect second card if present
    if (count > 1) {
      const second = cards.nth(1);
      await expect(second.locator('h3')).toBeVisible();
    }
  });
});
