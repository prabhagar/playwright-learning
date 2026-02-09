/**
 * DAY 2: Fixtures & Hooks - Example
 * - Demonstrates `beforeAll`, `beforeEach`, and using built-in `page` fixture
 * RUN: npm test -- tests/day-2/1-fixtures.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 2: Fixtures & Hooks', () => {
  test.beforeAll(async () => {
    // This runs once before all tests in this describe block
    console.log('Before all tests in fixtures.spec.js');
  });

  test.beforeEach(async ({ page }) => {
    // Common setup before each test: navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have a visible header and correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright Learning - Demo App/);
    const header = page.locator('header h1');
    await expect(header).toBeVisible();
  });

  test('should navigate to Forms section using fixture setup', async ({ page }) => {
    const formsLink = page.getByRole('link', { name: 'Forms' });
    await formsLink.click();
    const formsSection = page.locator('#forms');
    await expect(formsSection).toBeVisible();
  });

  test.afterEach(async () => {
    // Runs after each test
  });

  test.afterAll(async () => {
    console.log('All fixtures tests done');
  });
});
