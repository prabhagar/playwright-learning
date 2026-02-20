# Advanced Fixtures (Custom Fixtures + Dependency Setup)

## Goal
Learn how to create custom Playwright fixtures, compose fixture dependencies, and keep tests clean with reusable setup logic.

## Why this topic matters
- Repeated setup code makes tests noisy and harder to maintain.
- Custom fixtures centralize setup/teardown.
- Fixture dependencies let you build layered, reusable test contexts.

## Topics

### 1) Custom test fixtures with `test.extend`
You can add your own fixtures to Playwright's built-in ones:

```js
const test = base.extend({
  uniqueEmail: async ({}, use, testInfo) => {
    const value = `user-${testInfo.workerIndex}-${Date.now()}@example.com`;
    await use(value);
  },
});
```

### 2) Fixture dependency setup
Fixtures can depend on other fixtures:

```js
const test = base.extend({
  loggedInPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    // login steps...
    await use(page);
    await context.close();
  },

  usersPage: async ({ loggedInPage }, use) => {
    await loggedInPage.goto('/');
    await loggedInPage.locator('nav a', { hasText: 'Users API' }).click();
    await use(loggedInPage);
  },
});
```

### 3) Worker vs test-scoped fixtures
- **Test-scoped**: new value per test (good for page state).
- **Worker-scoped**: shared within worker (good for constants/heavy setup).

### 4) Fixture best practices
- Keep fixtures small and focused.
- Add teardown in fixture body after `await use(...)`.
- Avoid hidden side effects.
- Prefer stable selectors and assertion-based waits inside fixture setup.

## Hands-on exercises
1. Build a `loggedInPage` fixture using the login UI.
2. Build a `usersApiPage` fixture that depends on `loggedInPage`.
3. Add a `uniqueUserEmail` fixture and use it in a create-user flow.
4. Add cleanup/teardown to fixture contexts.

## Commands
- Run practice spec:
  - `npx playwright test tests/fixtures-locators/7-advanced-custom-fixtures.spec.js --project=chromium --reporter=list`

## Key takeaway
Great test architecture comes from reusable fixture layers: base setup → feature setup → focused assertions.
