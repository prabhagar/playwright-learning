/**
 * PRACTICE: Authentication & Session Management
 * Demonstrates saving login state and reusing it in a fresh context.
 *
 * RUN:
 * npx playwright test tests/fixtures-locators/6-auth-session-reuse.spec.js --project=chromium --reporter=list
 */

const { test, expect } = require('@playwright/test');

test.describe('Authentication & Session Management', () => {
  test('should login once, save storageState, and reuse authenticated session', async ({ browser }) => {
    const statePath = 'tests/.auth/auth-session-adminStorageState.json';

    // 1) Login in a fresh context
    const loginContext = await browser.newContext();
    const loginPage = await loginContext.newPage();

    await loginPage.goto('http://localhost:3000/login');
    await loginPage.fill('#username', 'admin');
    await loginPage.fill('#password', 'password');
    await loginPage.click('#loginBtn');

    // Logged-in indicator on login page
    await expect(loginPage.locator('#logout')).toBeVisible();

    // Save authenticated state
    await loginContext.storageState({ path: statePath });
    await loginContext.close();

    // 2) Reuse state in another context without logging in again
    const authedContext = await browser.newContext({ storageState: statePath });
    const authedPage = await authedContext.newPage();

    await authedPage.goto('http://localhost:3000/');

    // Home page reads localStorage and renders logout button
    await expect(authedPage.locator('#logout')).toBeVisible();

    await authedContext.close();
  });
});
