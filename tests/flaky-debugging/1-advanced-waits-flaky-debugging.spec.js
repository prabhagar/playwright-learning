/**
 * PRACTICE: Advanced Waits & Flaky Test Debugging
 *
 * RUN:
 * npx playwright test tests/flaky-debugging/1-advanced-waits-flaky-debugging.spec.js --project=chromium --reporter=list
 */

const { test, expect } = require('@playwright/test');

test.describe('Advanced Waits & Flaky Test Debugging', () => {
  test('should wait for loader lifecycle instead of fixed sleep', async ({ page }) => {
    await test.step('Navigate to Async Tasks section', async () => {
      await page.goto('/');
      await page.locator('nav a', { hasText: 'Async Tasks' }).click();
      await expect(page.locator('#async')).toBeVisible();
    });

    await test.step('Trigger async load and wait for meaningful signals', async () => {
      await page.click('#asyncLoadBtn');

      // Wait for loader visible, then hidden when load completes
      await expect(page.locator('#loadingIndicator')).toBeVisible();
      await expect(page.locator('#loadingIndicator')).toBeHidden();

      await expect(page.locator('#asyncData')).toBeVisible();
      await expect(page.locator('#asyncDataContent')).toContainText('Data loaded successfully');
    });
  });

  test('should use expect.poll for eventually updated async content', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Async Tasks' }).click();
    await page.click('#asyncLoadBtn');

    await expect
      .poll(async () => {
        const txt = await page.locator('#asyncDataContent').textContent();
        return txt || '';
      })
      .toContain('Data loaded successfully');
  });

  test('should wait for error state without arbitrary timeout', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Async Tasks' }).click();

    await page.getByRole('button', { name: 'Trigger Error' }).click();

    await expect(page.locator('#errorContainer')).toBeVisible();
    await expect(page.locator('#errorMessage')).toContainText('Failed to load data');
    await expect(page.locator('#loadingIndicator')).toBeHidden();
  });

  test('should wait for modal visibility transitions using assertions', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Modals' }).click();

    await page.getByRole('button', { name: 'Success Modal' }).click();
    await expect(page.locator('#successModal')).toHaveClass(/show/);

    await page.locator('#successModal button', { hasText: 'Close' }).click();
    await expect(page.locator('#successModal')).not.toHaveClass(/show/);
  });
});
