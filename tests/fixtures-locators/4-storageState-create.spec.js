/**
 * DAY 2: storageState - Create example
 * Writes a storage state JSON to `tests/.auth/adminStorageState.json`
 * RUN: npm test -- tests/day-2/4-storageState-create.spec.js
 */

const { test } = require('@playwright/test');

test('create storage state for admin', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Adjust URL/selectors to match your app
  await page.goto('http://localhost:3000/login');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'password');
  await page.click('button:has-text("Login")');

  // Wait for a logged-in indicator
  await page.waitForSelector('#logout', { timeout: 5000 });

  // Save storage state for reuse in other tests
  await context.storageState({ path: 'tests/.auth/adminStorageState.json' });
  await context.close();
});
