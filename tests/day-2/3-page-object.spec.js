/**
 * DAY 2: Page Object Pattern - Example
 * - Demonstrates a small in-file POM and usage in tests
 * RUN: npm test -- tests/day-2/3-page-object.spec.js
 */

const { test, expect } = require('@playwright/test');

class HomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('header h1');
    this.nav = page.locator('nav');
    this.cards = page.locator('.grid .card');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateTo(sectionName) {
    const link = this.nav.getByRole('link', { name: sectionName });
    await link.click();
    await this.page.waitForTimeout(200);
  }
}

test.describe('DAY 2: Page Object', () => {
  test('HomePage POM should navigate and verify sections', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.header).toBeVisible();

    await home.navigateTo('Forms');
    await expect(page.locator('#forms')).toBeVisible();

    await home.navigateTo('Tables');
    await expect(page.locator('#tables')).toBeVisible();
  });
});
