/**
 * DAY 3: Retries & Timeouts
 * Shows how to configure retries for a group and increase timeouts
 * RUN: npm test -- tests/day-3/3-retries-timeouts.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 3: Retries & Timeouts', () => {
  // Retry once for the tests in this group (use sparingly)
  test.describe.configure({ retries: 1 });

  test('example with extended timeout', async ({ page }) => {
    // Increase timeout for this test (ms)
    test.setTimeout(30000);

    await page.goto('/');
    // Simulate a slow operation; in real tests this would be a slow API or animation
    await page.waitForTimeout(1000);

    const title = await page.title();
    expect(title).toContain('Playwright Learning');
  });
});
