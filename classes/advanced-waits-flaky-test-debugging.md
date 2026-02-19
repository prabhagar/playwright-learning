# Advanced Waits & Flaky Test Debugging

## Goal
Learn how to replace fragile sleeps (`waitForTimeout`) with reliable Playwright waiting strategies and debug flaky tests faster.

## Why this class matters
- Flaky tests usually come from timing assumptions.
- Fixed sleeps make tests slower and still unreliable.
- Playwright has built-in auto-waiting and smart assertions you should prefer.

## Topics

### 1) Prefer auto-waiting assertions
- `await expect(locator).toBeVisible()`
- `await expect(locator).toHaveText(...)`
- `await expect(locator).toBeHidden()`

These retry automatically until timeout.

### 2) Wait for the right signal
Use explicit waits tied to app behavior:
- `waitForResponse` for API/network completion
- `waitForURL` for navigation changes
- `waitForLoadState('networkidle')` only when appropriate
- `locator.waitFor({ state: 'visible' })` for DOM state transitions

### 3) Polling for eventual consistency
When values stabilize over time, use:
```js
await expect.poll(async () => {
  return await page.locator('#value').textContent();
}).toContain('ready');
```

### 4) Flaky test debugging workflow
- Re-run in headed/debug mode
- Add `test.step(...)` to isolate failing stage
- Capture trace (`trace: on-first-retry` already enabled in this project)
- Use stable locators and avoid race conditions

## Hands-on exercises
1. Replace a `waitForTimeout` with an assertion-based wait.
2. Wait for a loader to appear and then disappear.
3. Validate async content with `expect.poll`.
4. Run in debug mode and inspect trace for one test.

## Commands
- Run practice spec:
  - `npx playwright test tests/flaky-debugging/1-advanced-waits-flaky-debugging.spec.js --project=chromium --reporter=list`
- Run in debug mode:
  - `npx playwright test tests/flaky-debugging/1-advanced-waits-flaky-debugging.spec.js --project=chromium --debug`

## Key takeaway
Stable E2E tests wait for **meaningful signals**, not arbitrary time.
