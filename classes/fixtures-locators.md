## Class 2 — Fixtures, Locators & Test Organization

Goals
- Understand Playwright test fixtures and hooks (`beforeAll`, `beforeEach`, `afterEach`, `afterAll`).
- Use robust locators (`locator()`, `getByRole`, `hasText`, attribute selectors).
- Organize tests: parameterized tests, `test.describe`, and a simple Page Object pattern.
- Hands-on exercises to reinforce concepts.

Lesson Outline

1) Fixtures & Hooks
- What fixtures are and built-in fixtures (`page`, `browser`, `context`).
- Using `test.beforeAll` and `test.beforeEach` for setup.
- When to use `test.describe` scoped hooks vs global.

2) Locators
- Prefer `page.getByRole()` and `page.locator()` over raw selectors.
- Using `hasText`, `filter`, `.nth()` and chained locators.
- Best practices: use assertions that wait (e.g., `toBeVisible`, `toHaveText`).

3) Test Organization
- Group related tests with `test.describe`.
- Parameterize tests with loops or `test.describe.parallel`.
- Keep tests readable: Arrange, Act, Assert.

4) Page Object Pattern
- Create small page classes exposing actions and locators.
- Keep selectors in one place, actions as methods.

Exercises
- Exercise 1: Write a fixture that provides a logged-in `page` (use `storageState`).
- Exercise 2: Create locators for the Forms section and verify validation messages.
- Exercise 3: Implement a `HomePage` POM and use it in a test to navigate sections.

Notes
- These examples assume the local server is available at `http://localhost:3000` (use `npm run serve`).

5) Login & `storageState`
- Use a dedicated script/test to authenticate and call `await context.storageState({ path: 'tests/.auth/adminStorageState.json' })`.
- Reuse that file in tests with `test.use({ storageState: 'tests/.auth/adminStorageState.json' })` to run as an authenticated user.

StorageState Example

```javascript
// create-storage-state.spec.js
const { test } = require('@playwright/test');

test('create storage state for admin', async ({ browser }) => {
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto('http://localhost:3000/login');
	await page.fill('#username', 'admin');
	await page.fill('#password', 'password');
	await page.click('button:has-text("Login")');
	// wait for an element that's visible only when logged in
	await page.waitForSelector('#logout');
	await context.storageState({ path: 'tests/.auth/adminStorageState.json' });
	await context.close();
});
```

Using the saved state in other tests:

```javascript
// use-storage-state.spec.js
const { test, expect } = require('@playwright/test');

test.use({ storageState: 'tests/.auth/adminStorageState.json' });

test('runs as logged in user', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#logout')).toBeVisible();
});
```

Exercise Skeleton

- Add a `tests/.auth` folder and create a storage state for a test user.
- Write one test that relies on the stored state and another that regenerates it.
