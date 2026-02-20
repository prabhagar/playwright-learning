/**
 * PRACTICE: Advanced Fixtures (Custom Fixtures + Dependency Setup)
 *
 * RUN:
 * npx playwright test tests/fixtures-locators/7-advanced-custom-fixtures.spec.js --project=chromium --reporter=list
 */

const base = require('@playwright/test');
const { expect } = base;

const test = base.test.extend({
  uniqueUserEmail: async ({}, use, testInfo) => {
    const email = `fixture-user-${testInfo.workerIndex}-${Date.now()}@example.com`;
    await use(email);
  },

  loggedInPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('http://localhost:3000/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'password');
    await page.click('#loginBtn');
    await expect(page.locator('#logout')).toBeVisible();

    await use(page);
    await context.close();
  },

  usersApiPage: async ({ loggedInPage }, use) => {
    await loggedInPage.goto('http://localhost:3000/');
    await loggedInPage.locator('nav a', { hasText: 'Users API' }).click();
    await expect(loggedInPage.locator('#users')).toBeVisible();

    await use(loggedInPage);
  },
});

test.describe('Advanced Fixtures: Custom + Dependency Setup', () => {
  test('loggedInPage fixture should provide authenticated page state', async ({ loggedInPage }) => {
    await loggedInPage.goto('http://localhost:3000/');
    await expect(loggedInPage.locator('#logout')).toBeVisible();
  });

  test('usersApiPage fixture should navigate directly to users section', async ({ usersApiPage }) => {
    await expect(usersApiPage.locator('#users h2')).toHaveText('Users API');
    await usersApiPage.click('#fetchUsersBtn');
    await expect(usersApiPage.locator('#usersList .user-item')).toHaveCount(3);
  });

  test('uniqueUserEmail fixture should generate isolated test data', async ({ usersApiPage, uniqueUserEmail }) => {
    await usersApiPage.click('#fetchUsersBtn');
    const beforeCount = await usersApiPage.locator('#usersList .user-item').count();

    await usersApiPage.getByRole('button', { name: 'Create New User' }).click();
    await usersApiPage.fill('#newUserName', 'Fixture User');
    await usersApiPage.fill('#newUserEmail', uniqueUserEmail);
    await usersApiPage.selectOption('#newUserRole', 'user');
    await usersApiPage.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(usersApiPage.locator('#usersList .user-item')).toHaveCount(beforeCount + 1);
    await expect(usersApiPage.locator('#usersList')).toContainText(uniqueUserEmail);
  });
});
