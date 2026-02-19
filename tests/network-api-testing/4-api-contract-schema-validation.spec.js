/**
 * PRACTICE: API Contract Testing (Schema Validation)
 *
 * RUN:
 * npx playwright test tests/network-api-testing/4-api-contract-schema-validation.spec.js --project=chromium --reporter=list
 */

const { test, expect } = require('@playwright/test');

const allowedRoles = ['admin', 'user', 'moderator'];
const allowedStatuses = ['active', 'inactive'];

function validateUserContract(user) {
  expect(user).toBeTruthy();
  expect(typeof user).toBe('object');

  expect(typeof user.id).toBe('number');
  expect(Number.isInteger(user.id)).toBe(true);

  expect(typeof user.name).toBe('string');
  expect(user.name.length).toBeGreaterThan(0);

  expect(typeof user.email).toBe('string');
  expect(user.email).toContain('@');

  expect(typeof user.role).toBe('string');
  expect(allowedRoles).toContain(user.role);

  expect(typeof user.status).toBe('string');
  expect(allowedStatuses).toContain(user.status);
}

test.describe('API Contract Testing (Schema Validation)', () => {
  test('GET /api/users should return an array of valid user contracts', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/users');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);

    for (const user of users) {
      validateUserContract(user);
    }
  });

  test('GET /api/users/:id should return one valid user contract', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/users/42');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const user = await response.json();
    validateUserContract(user);
    expect(user.id).toBe(42);
  });

  test('POST /api/users should return 201 with created user contract', async ({ request }) => {
    const payload = {
      name: 'Contract Test User',
      email: `contract-${Date.now()}@example.com`,
      role: 'user',
    };

    const response = await request.post('http://localhost:3000/api/users', {
      data: payload,
    });

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');

    const created = await response.json();
    validateUserContract(created);
    expect(created.name).toBe(payload.name);
    expect(created.email).toBe(payload.email);
    expect(created.role).toBe(payload.role);
  });

  test('POST /api/users should return 400 error contract when required fields are missing', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/users', {
      data: { role: 'user' },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('application/json');

    const errorBody = await response.json();
    expect(typeof errorBody).toBe('object');
    expect(typeof errorBody.error).toBe('string');
    expect(errorBody.error).toContain('Name and email are required');
  });
});
