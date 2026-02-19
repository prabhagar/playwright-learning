/**
 * PRACTICE: Parallel Testing & Sharding
 *
 * RUN:
 * npx playwright test tests/parallel-testing/1-parallel-sharding.spec.js --project=chromium --reporter=list
 * npx playwright test tests/parallel-testing/1-parallel-sharding.spec.js --project=chromium --shard=1/2 --reporter=list
 * npx playwright test tests/parallel-testing/1-parallel-sharding.spec.js --project=chromium --shard=2/2 --reporter=list
 */

const { test, expect } = require('@playwright/test');

test.describe.parallel('Parallel Testing & Sharding', () => {
  test('home page should load with correct title', async ({ page }, testInfo) => {
    const runId = `worker-${testInfo.workerIndex}-${Date.now()}`;

    await page.goto('/');
    await expect(page).toHaveTitle('Playwright Learning - Demo App');

    console.log(`Run: ${runId} | Test: title check`);
  });

  test('forms section should be reachable', async ({ page }, testInfo) => {
    const runId = `worker-${testInfo.workerIndex}-${Date.now()}`;

    await page.goto('/');
    await page.locator('nav a', { hasText: 'Forms' }).click();
    await expect(page.locator('#forms h2')).toHaveText('Form Testing');

    console.log(`Run: ${runId} | Test: forms navigation`);
  });

  test('tables section should load table data', async ({ page }, testInfo) => {
    const runId = `worker-${testInfo.workerIndex}-${Date.now()}`;

    await page.goto('/');
    await page.locator('nav a', { hasText: 'Tables' }).click();
    await page.click('#loadTableBtn');
    await expect(page.locator('#dataTable')).toBeVisible();
    await expect(page.locator('#tableBody tr')).toHaveCount(5);

    console.log(`Run: ${runId} | Test: table load`);
  });

  test('modals section should open success modal', async ({ page }, testInfo) => {
    const runId = `worker-${testInfo.workerIndex}-${Date.now()}`;

    await page.goto('/');
    await page.locator('nav a', { hasText: 'Modals' }).click();
    await page.getByRole('button', { name: 'Success Modal' }).click();
    await expect(page.locator('#successModal')).toHaveClass(/show/);

    console.log(`Run: ${runId} | Test: modal open`);
  });
});
