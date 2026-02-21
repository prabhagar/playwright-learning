/**
 * PRACTICE: Playwright Reporters & Custom Reporting
 *
 * RUN:
 * npx playwright test tests/reporting/1-reporters-custom-reporting.spec.js --project=chromium --reporter=list
 * npx playwright test tests/reporting/1-reporters-custom-reporting.spec.js --project=chromium --reporter=./reporters/learning-summary-reporter.js
 */

const { test, expect } = require('@playwright/test');

test.describe('Reporters & Custom Reporting', () => {
  test('should verify home page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Playwright Learning - Demo App');
  });

  test('should verify forms section heading', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Forms' }).click();
    await expect(page.locator('#forms h2')).toHaveText('Form Testing');
  });

  test('should verify users list can be loaded', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Users API' }).click();
    await page.click('#fetchUsersBtn');
    await expect(page.locator('#usersList .user-item')).toHaveCount(3);
  });
});
