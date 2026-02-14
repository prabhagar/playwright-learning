/**
 * DAY 3: Network Mocking
 * Demonstrates `page.route` to mock API responses.
 * RUN: npm test -- tests/day-3/1-network-mocking.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 3: Network Mocking', () => {
  test('mocks /api/users and verifies response inside page', async ({ page }) => {
    // Mock the API endpoint
    await page.route('**/api/users', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }])
      })
    );

    // From page context, fetch the API and validate the mocked data
    await page.goto('/');

    const users = await page.evaluate(async () => {
      const res = await fetch('/api/users');
      return res.json();
    });

    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(2);
    expect(users[0].name).toBe('Alice');
  });
});
