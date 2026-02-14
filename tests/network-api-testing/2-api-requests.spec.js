/**
 * DAY 3: API Requests
 * Demonstrates using the `request` fixture for API-level tests
 * RUN: npm test -- tests/day-3/2-api-requests.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 3: API Requests', () => {
  test('should GET /api/health and expect 200', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/health');
    expect(response.status()).toBe(200);
    const json = await response.json().catch(() => null);
    // If your app returns JSON health info, assert common fields
    if (json) expect(Object.prototype.hasOwnProperty.call(json, 'status')).toBeTruthy();
  });
});
