/**
 * DAY 2: storageState - Use example
 * Demonstrates using a saved storageState for authenticated tests
 * RUN: npm test -- tests/day-2/5-storageState-use.spec.js
 */

const { test, expect } = require('@playwright/test');

test.use({ storageState: 'tests/.auth/adminStorageState.json' });

test('runs as logged-in user via storageState', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  const logout = page.locator('#logout');
  await expect(logout).toBeVisible();
});
