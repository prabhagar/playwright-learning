/**
 * DAY 1: MODAL & DIALOG INTERACTIONS
 * 
 * This file demonstrates working with modals and dialogs:
 * - Opening and closing modals
 * - Interacting with modal buttons
 * - Filling modal forms
 * - Handling modal overlays
 * - Waiting for modal appearance/disappearance
 * 
 * RUN THIS TEST:
 * npm test -- tests/day-1-basics/4-modal-interactions.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 1: Modal & Dialog Interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the Modals section
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Modals' }).click();
    await page.waitForTimeout(300);
  });

  // TEST 1: Open Success Modal
  // CONCEPT: Opening modal dialogs and verifying visibility
  test('should open success modal when button is clicked', async ({ page }) => {
    // Click success modal button
    const successButton = page.locator('button', { hasText: 'Success Modal' });
    await successButton.click();
    
    // Wait for modal to appear
    await page.waitForTimeout(300);
    
    // Verify modal is visible
    const modal = page.locator('#successModal');
    await expect(modal).toHaveClass(/show/);
    
    // Verify modal content
    const header = page.locator('#successModal .modal-header');
    await expect(header).toContainText('Success');
  });

  // TEST 2: Close Success Modal
  // CONCEPT: Closing modals by clicking close button
  test('should close success modal when close button is clicked', async ({ page }) => {
    // Open modal
    const successButton = page.locator('button', { hasText: 'Success Modal' });
    await successButton.click();
    await page.waitForTimeout(300);
    
    // Verify it's open
    let modal = page.locator('#successModal');
    await expect(modal).toHaveClass(/show/);
    
    // Click close button
    const closeButton = page.locator('#successModal button', { hasText: 'Close' });
    await closeButton.click();
    await page.waitForTimeout(300);
    
    // Verify modal is closed
    modal = page.locator('#successModal');
    expect(await modal.getAttribute('class')).not.toContain('show');
  });

  // TEST 3: Open Error Modal
  // CONCEPT: Opening different modal types
  test('should open error modal and display error message', async ({ page }) => {
    // Click error modal button
    const errorButton = page.locator('button', { hasText: 'Error Modal' });
    await errorButton.click();
    await page.waitForTimeout(300);
    
    // Verify modal is visible
    const modal = page.locator('#errorModal');
    await expect(modal).toHaveClass(/show/);
    
    // Verify error header
    const header = page.locator('#errorModal .modal-header');
    await expect(header).toContainText('Error');
    
    // Verify error message
    const body = page.locator('#errorModal .modal-body');
    await expect(body).toContainText('occurred during processing');
  });

  // TEST 4: Close Error Modal with Danger Button
  // CONCEPT: Closing modals with different button styles
  test('should close error modal with danger button', async ({ page }) => {
    // Open error modal
    await page.locator('button', { hasText: 'Error Modal' }).click();
    await page.waitForTimeout(300);
    
    // Click danger close button
    const closeButton = page.locator('#errorModal button', { hasText: 'Close' });
    await closeButton.click();
    await page.waitForTimeout(300);
    
    // Verify modal is closed
    const modal = page.locator('#errorModal');
    expect(await modal.getAttribute('class')).not.toContain('show');
  });

  // TEST 5: Input Modal - Fill and Submit
  // CONCEPT: Filling forms within modals
  test('should fill and submit input modal', async ({ page }) => {
    // Open input modal
    const inputButton = page.locator('button', { hasText: 'Input Modal' });
    await inputButton.click();
    await page.waitForTimeout(300);
    
    // Verify modal is open
    const modal = page.locator('#inputModal');
    await expect(modal).toHaveClass(/show/);
    
    // Fill input field
    const input = page.locator('#modalInput');
    await input.fill('Test User Name');
    
    // Click submit button
    const submitButton = page.locator('#inputModal button', { hasText: 'Submit' });
    await submitButton.click();
    await page.waitForTimeout(500);
    
    // Verify modal is closed after submission
    expect(await modal.getAttribute('class')).not.toContain('show');
  });

  // TEST 6: Input Modal - Cancel Button
  // CONCEPT: Canceling modal actions
  test('should close input modal when cancel button is clicked', async ({ page }) => {
    // Open input modal
    await page.locator('button', { hasText: 'Input Modal' }).click();
    await page.waitForTimeout(300);
    
    // Fill input
    await page.locator('#modalInput').fill('Some text');
    
    // Click cancel
    const cancelButton = page.locator('#inputModal button', { hasText: 'Cancel' });
    await cancelButton.click();
    await page.waitForTimeout(300);
    
    // Verify modal is closed
    const modal = page.locator('#inputModal');
    expect(await modal.getAttribute('class')).not.toContain('show');
  });

  // TEST 7: Confirmation Modal - Cancel
  // CONCEPT: Handling confirmation dialogs
  test('should handle confirmation modal with cancel', async ({ page }) => {
    // Open confirmation modal
    const confirmButton = page.locator('button', { hasText: 'Confirmation Modal' });
    await confirmButton.click();
    await page.waitForTimeout(300);
    
    // Verify modal is open with confirmation message
    const modal = page.locator('#confirmModal');
    await expect(modal).toHaveClass(/show/);
    
    const body = page.locator('#confirmModal .modal-body');
    await expect(body).toContainText('Are you sure');
    
    // Click cancel
    const cancelButton = page.locator('#confirmModal button', { hasText: 'Cancel' });
    await cancelButton.click();
    await page.waitForTimeout(300);
    
    // Verify modal closed
    expect(await modal.getAttribute('class')).not.toContain('show');
  });

  // TEST 8: Confirmation Modal - Confirm
  // CONCEPT: Completing confirmation action
  test('should handle confirmation modal with confirm action', async ({ page }) => {
    // Open confirmation modal
    await page.locator('button', { hasText: 'Confirmation Modal' }).click();
    await page.waitForTimeout(300);
    
    // Click confirm
    const confirmButton = page.locator('#confirmModal button', { hasText: 'Confirm' });
    await confirmButton.click();
    await page.waitForTimeout(500);
    
    // Verify modal closed
    const modal = page.locator('#confirmModal');
    expect(await modal.getAttribute('class')).not.toContain('show');
    
    // Verify confirmation message shown
    const alert = page.locator('#formAlert');
    if (await alert.isVisible()) {
      await expect(alert).toContainText('confirmed');
    }
  });

  // TEST 9: Sequential Modal Interactions
  // CONCEPT: Opening and closing multiple modals in sequence
  test('should handle opening multiple modals sequentially', async ({ page }) => {
    // Open success modal
    await page.locator('button', { hasText: 'Success Modal' }).click();
    await page.waitForTimeout(300);
    
    let modal = page.locator('#successModal');
    await expect(modal).toHaveClass(/show/);
    
    // Close it
    await page.locator('#successModal button', { hasText: 'Close' }).click();
    await page.waitForTimeout(300);
    
    // Open error modal
    await page.locator('button', { hasText: 'Error Modal' }).click();
    await page.waitForTimeout(300);
    
    modal = page.locator('#errorModal');
    await expect(modal).toHaveClass(/show/);
    
    // Close it
    await page.locator('#errorModal button', { hasText: 'Close' }).click();
    await page.waitForTimeout(300);
    
    // Open input modal
    await page.locator('button', { hasText: 'Input Modal' }).click();
    await page.waitForTimeout(300);
    
    modal = page.locator('#inputModal');
    await expect(modal).toHaveClass(/show/);
  });

  // TEST 10: Modal Content Verification
  // CONCEPT: Verifying specific content within modals
  test('should verify modal content includes all elements', async ({ page }) => {
    // Open input modal
    await page.locator('button', { hasText: 'Input Modal' }).click();
    await page.waitForTimeout(300);
    
    // Verify modal structure
    const modal = page.locator('#inputModal');
    const header = modal.locator('.modal-header');
    const body = modal.locator('.modal-body');
    const footer = modal.locator('.modal-footer');
    
    await expect(header).toBeVisible();
    await expect(body).toBeVisible();
    await expect(footer).toBeVisible();
    
    // Verify input field exists in body
    const input = body.locator('input');
    await expect(input).toBeVisible();
  });

  // TEST 11: Modal Overlay Click Closes Modal
  // CONCEPT: Handling clicks outside modal (if configured)
  test('should handle modal overlay interaction', async ({ page }) => {
    // Open success modal
    await page.locator('button', { hasText: 'Success Modal' }).click();
    await page.waitForTimeout(300);
    
    // Try clicking outside modal (on overlay)
    const modal = page.locator('#successModal');
    
    // Click on modal element (overlay area)
    // This is configured to close in the demo app
    await modal.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
    
    // Verify modal closed
    const classList = await modal.getAttribute('class');
    expect(classList).not.toContain('show');
  });

  // TEST 12: Verify Modal Button Types
  // CONCEPT: Verifying button styles correspond to their actions
  test('should have correct button types in modals', async ({ page }) => {
    // Open success modal
    await page.locator('button', { hasText: 'Success Modal' }).click();
    await page.waitForTimeout(300);
    
    // Verify close button has primary style
    const closeButton = page.locator('#successModal button', { hasText: 'Close' });
    const successButtonClass = await closeButton.getAttribute('class');
    expect(successButtonClass).toContain('btn-primary');
    
    // Close success modal
    await closeButton.click();
    await page.waitForTimeout(300);
    
    // Open error modal
    await page.locator('button', { hasText: 'Error Modal' }).click();
    await page.waitForTimeout(300);
    
    // Verify error close button has danger style
    const errorCloseButton = page.locator('#errorModal button', { hasText: 'Close' });
    const errorButtonClass = await errorCloseButton.getAttribute('class');
    expect(errorButtonClass).toContain('btn-danger');
  });

  // TEST 13: Form Submission Flow in Modal
  // CONCEPT: Complete form submission scenario within modal
  test('should submit form within modal and get success confirmation', async ({ page }) => {
    // Open input modal
    await page.locator('button', { hasText: 'Input Modal' }).click();
    await page.waitForTimeout(300);
    
    // Verify modal is visible
    const modal = page.locator('#inputModal');
    await expect(modal).toHaveClass(/show/);
    
    // Fill form
    const testName = 'John Playwright';
    await page.locator('#modalInput').fill(testName);
    
    // Submit
    await page.locator('#inputModal button', { hasText: 'Submit' }).click();
    await page.waitForTimeout(500);
    
    // Verify modal closed
    expect(await modal.getAttribute('class')).not.toContain('show');
  });

  // TEST 14: Multiple Modals Stack
  // CONCEPT: Handling multiple modals (if feature implemented)
  test('should properly display modal headers and bodies', async ({ page }) => {
    const modals = ['Success Modal', 'Error Modal', 'Input Modal', 'Confirmation Modal'];
    const modalIds = ['successModal', 'errorModal', 'inputModal', 'confirmModal'];
    
    for (let i = 0; i < modals.length; i++) {
      const modalName = modals[i];
      const modalId = modalIds[i];
      
      // Open modal
      await page.locator('button', { hasText: modalName }).click();
      await page.waitForTimeout(300);
      
      // Verify modal is visible
      const modal = page.locator(`#${modalId}`);
      await expect(modal).toHaveClass(/show/);
      
      // Verify header and body exist
      const header = modal.locator('.modal-header');
      const body = modal.locator('.modal-body');
      
      await expect(header).toBeVisible();
      await expect(body).toBeVisible();
      
      // Close modal - click the first button that closes
      const closeBtn = modal.locator('button').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
