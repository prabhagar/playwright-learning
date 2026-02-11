## Class 3 — Network Mocking, API Tests & Retries

Goals
- Learn to intercept and mock network requests with `page.route`.
- Use Playwright's `request` fixture for API-level testing.
- Handle flaky tests with retries and adjust timeouts safely.

Lesson Outline

1) Network interception & mocking
- Use `page.route(url, handler)` to inspect, modify, or mock responses.
- Common uses: simulate server errors, return fixture data, throttle responses.
- Best practice: mock only external/unstable endpoints, keep UI assertions realistic.

2) API testing with `request`
- Use `test`'s `request` fixture: `const r = await request.get(url)`.
- Assert status, headers and JSON payloads without a browser.

3) Retries & timeouts
- Use `test.describe.configure({ retries: N })` to retry flaky groups.
- Increase per-test timeout with `test.setTimeout(ms)` or pass `timeout` in config.
- Prefer fixing root causes; use retries sparingly.

Examples and exercises are in `tests/day-3`:
- `1-network-mocking.spec.js` — shows `page.route` and mocking.
- `2-api-requests.spec.js` — shows `request` usage to call APIs.
- `3-retries-timeouts.spec.js` — demonstrates retries and extended timeouts.

How to run

Start the local server and run Day-3 tests:

```bash
npm run serve
npm test -- tests/day-3
```

Exercises
- Mock a failing API and verify the UI shows an error message.
- Write an API test that validates a pagination endpoint.
- Identify a flaky test in your suite and add a single retry while you fix it.
