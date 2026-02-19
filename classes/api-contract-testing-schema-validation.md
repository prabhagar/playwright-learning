# API Contract Testing (Schema Validation)

## Goal
Learn how to validate API response contracts in Playwright so backend changes are caught early and safely.

## Why this class matters
- Status code checks alone are not enough.
- Contract tests ensure response **shape**, **types**, and **required fields** stay stable.
- They reduce production bugs caused by unexpected API changes.

## Topics

### 1) What is API contract testing?
- Verifies that API responses follow an agreed contract.
- Checks:
  - Required keys exist
  - Value types are correct
  - Enum-like fields contain allowed values

### 2) Schema validation approach (without extra library)
In this class we use helper functions to validate:
- Object shape
- Field types
- Allowed values for fields like `role` and `status`

### 3) Useful patterns
- Validate list endpoints (e.g., `GET /api/users`) item by item.
- Validate single-resource endpoints (e.g., `GET /api/users/:id`).
- Validate error contracts (e.g., `POST /api/users` missing required fields should return 400 + error message).

### 4) What to assert in contracts
- HTTP status (`200`, `201`, `400`, etc.)
- JSON content type
- Required properties
- Type safety (`id` is number, `email` is string)
- Domain constraints (allowed roles/status values)

## Hands-on exercises

1. Contract test `GET /api/users` list response.
2. Contract test `GET /api/users/:id` single object response.
3. Contract test `POST /api/users` success response.
4. Contract test `POST /api/users` validation error response.

## Commands
- Run contract practice tests:
  - `npx playwright test tests/network-api-testing/4-api-contract-schema-validation.spec.js --project=chromium --reporter=list`

## Key takeaway
Contract tests make API suites resilient: they detect silent breaking changes before UI tests or users are affected.
