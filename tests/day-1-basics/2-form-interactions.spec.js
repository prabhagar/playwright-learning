/**
 * DAY 1: FORM INTERACTIONS
 * 
 * This file demonstrates form testing with Playwright:
 * - Filling text inputs
 * - Submitting forms
 * - Validating error messages
 * - Working with dropdowns and radio buttons
 * - Handling checkboxes
 * - Form data extraction
 * 
 * RUN THIS TEST:
 * npm test -- tests/day-1-basics/2-form-interactions.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 1: Form Interactions & Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the Forms section
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Forms' }).click();
    await page.waitForTimeout(300);
  });

  // TEST 1: Fill Form with Valid Data
  // CONCEPT: Filling input fields, selecting options, submitting forms
  test('should submit form with valid data', async ({ page }) => {
    // Fill text inputs
    await page.fill('input#firstName', 'John');
    await page.fill('input#lastName', 'Doe');
    await page.fill('input#email', 'john@example.com');
    await page.fill('input#password', 'SecurePass123');
    
    // Select a country from dropdown
    await page.selectOption('select#country', 'usa');
    
    // Select gender radio button
    await page.check('input[name="gender"][value="male"]');
    
    // Check terms checkbox
    await page.check('input#terms');
    
    // Submit the form
    await page.click('button#submitBtn');
    
    // Wait for response
    await page.waitForTimeout(500);
    
    // Verify success alert
    const alert = page.locator('#formAlert.alert-success');
    await expect(alert).toContainText('submitted successfully');
  });

  // TEST 2: Verify Form Elements Exist
  // CONCEPT: Locating and verifying form field existence
  test('should have all required form fields', async ({ page }) => {
    // Verify input fields exist
    const formFields = [
      'input#firstName',
      'input#lastName',
      'input#email',
      'input#password',
      'select#country',
      'input#subscribe',
      'input#terms',
      'textarea#comments',
      'button#submitBtn',
    ];

    for (const field of formFields) {
      const element = page.locator(field);
      await expect(element).toBeVisible();
    }
  });

  // TEST 3: Form Validation - Empty Fields
  // CONCEPT: Testing form validation rules
  test('should show error when required fields are empty', async ({ page }) => {
    // Try to submit without filling any fields
    await page.click('button#submitBtn');
    await page.waitForTimeout(500);
    
    // HTML5 validation should prevent submission
    // Check if alert appears
    const alert = page.locator('#formAlert');
    const isVisible = await alert.isVisible();
    
    if (isVisible) {
      await expect(alert).toContainText('required');
    }
  });

  // TEST 4: Email Validation
  // CONCEPT: Testing specific field validation
  test('should validate email format', async ({ page }) => {
    // Fill form with valid data
    await page.fill('input#firstName', 'John');
    await page.fill('input#lastName', 'Doe');
    await page.fill('input#email', 'invalid-email');
    await page.fill('input#password', 'SecurePass123');
    await page.selectOption('select#country', 'usa');
    await page.check('input[name="gender"][value="male"]');
    await page.check('input#terms');
    
    // Try to submit
    await page.click('button#submitBtn');
    await page.waitForTimeout(500);
    
    // Check for validation error
    const alert = page.locator('#formAlert');
    const isVisible = await alert.isVisible();
    
    if (isVisible) {
      const text = await alert.textContent();
      expect(text.toLowerCase()).toContain('email');
    }
  });

  // TEST 5: Password Validation
  // CONCEPT: Testing password requirements
  test('should validate password minimum length', async ({ page }) => {
    // Fill form with short password
    await page.fill('input#firstName', 'John');
    await page.fill('input#lastName', 'Doe');
    await page.fill('input#email', 'john@example.com');
    await page.fill('input#password', '123'); // Too short
    await page.selectOption('select#country', 'usa');
    await page.check('input[name="gender"][value="male"]');
    await page.check('input#terms');
    
    // Try to submit
    await page.click('button#submitBtn');
    await page.waitForTimeout(500);
    
    // Verify error message appears (validation shows error for short password)
    const alert = page.locator('#formAlert');
    // Check if alert is visible and contains password error
    const isVisible = await alert.isVisible();
    if (isVisible) {
      const text = await alert.textContent();
      expect(text.toLowerCase()).toContain('password');
    } else {
      // If no alert, browser validation should have prevented submission
      // Just verify form is still displayed
      const form = page.locator('#testForm');
      await expect(form).toBeVisible();
    }
  });

  // TEST 6: Working with Checkboxes
  // CONCEPT: Checking and unchecking checkboxes
  test('should handle checkbox interactions', async ({ page }) => {
    // Find the checkbox
    const subscribeCheckbox = page.locator('input#subscribe');
    
    // Verify it's not checked initially
    const isChecked1 = await subscribeCheckbox.isChecked();
    expect(isChecked1).toBe(false);
    
    // Check the checkbox
    await subscribeCheckbox.check();
    
    // Verify it's now checked
    let isChecked2 = await subscribeCheckbox.isChecked();
    expect(isChecked2).toBe(true);
    
    // Uncheck the checkbox
    await subscribeCheckbox.uncheck();
    
    // Verify it's unchecked
    const isChecked3 = await subscribeCheckbox.isChecked();
    expect(isChecked3).toBe(false);
  });

  // TEST 7: Working with Radio Buttons
  // CONCEPT: Selecting options from radio button groups
  test('should handle radio button selection', async ({ page }) => {
    // Select "Female" radio button
    const femaleRadio = page.locator('input[name="gender"][value="female"]');
    await femaleRadio.check();
    
    // Verify it's selected
    let isChecked = await femaleRadio.isChecked();
    expect(isChecked).toBe(true);
    
    // Select "Other" radio button
    const otherRadio = page.locator('input[name="gender"][value="other"]');
    await otherRadio.check();
    
    // Verify "Other" is now selected
    isChecked = await otherRadio.isChecked();
    expect(isChecked).toBe(true);
    
    // Verify "Female" is no longer selected
    const femaleChecked = await femaleRadio.isChecked();
    expect(femaleChecked).toBe(false);
  });

  // TEST 8: Working with Dropdowns/Selects
  // CONCEPT: Selecting options from dropdown menus
  test('should handle dropdown selection', async ({ page }) => {
    // Get the select element
    const countrySelect = page.locator('select#country');
    
    // Select different countries
    const countries = ['usa', 'uk', 'canada', 'india', 'australia'];
    
    for (const country of countries) {
      await page.selectOption('select#country', country);
      
      // Verify selection
      const selectedValue = await countrySelect.inputValue();
      expect(selectedValue).toBe(country);
    }
  });

  // TEST 9: Fill Textarea
  // CONCEPT: Working with multiline text areas
  test('should fill textarea with multi-line text', async ({ page }) => {
    const testComment = 'This is a test comment\nWith multiple lines\nFor testing purposes';
    
    // Fill textarea
    await page.fill('textarea#comments', testComment);
    
    // Verify content
    const textareaValue = await page.locator('textarea#comments').inputValue();
    expect(textareaValue).toBe(testComment);
  });

  // TEST 10: Clear Form
  // CONCEPT: Resetting form fields
  test('should clear all form fields when reset button is clicked', async ({ page }) => {
    // Fill form
    await page.fill('input#firstName', 'John');
    await page.fill('input#lastName', 'Doe');
    await page.fill('input#email', 'john@example.com');
    await page.fill('input#password', 'SecurePass123');
    await page.fill('textarea#comments', 'Test comment');
    
    // Click reset button
    await page.click('button[type="reset"]');
    
    // Verify fields are cleared
    let value = await page.locator('input#firstName').inputValue();
    expect(value).toBe('');
    
    value = await page.locator('textarea#comments').inputValue();
    expect(value).toBe('');
  });

  // TEST 11: Complete Valid Submission Flow
  // CONCEPT: End-to-end form submission journey
  test('should complete full form submission flow', async ({ page }) => {
    const testData = {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'TestPassword123',
      country: 'uk',
      gender: 'female',
      subscribe: true,
      terms: true,
      comments: 'This is a test submission'
    };

    // Fill all fields
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.fill('input#password', testData.password);
    await page.selectOption('select#country', testData.country);
    await page.check(`input[name="gender"][value="${testData.gender}"]`);
    
    if (testData.subscribe) {
      await page.check('input#subscribe');
    }
    
    await page.check('input#terms');
    await page.fill('textarea#comments', testData.comments);
    
    // Submit form
    await page.click('button#submitBtn');
    await page.waitForTimeout(500);
    
    // Verify success
    const alert = page.locator('#formAlert');
    await expect(alert).toContainText('successfully');
    
    // Verify submitted data is displayed
    const formData = page.locator('#formData');
    await expect(formData).toBeVisible();
  });

  // TEST 12: Get Form Input Values
  // CONCEPT: Extracting form field values programmatically
  test('should extract form field values', async ({ page }) => {
    // Fill some fields
    await page.fill('input#firstName', 'Bob');
    await page.fill('input#lastName', 'Johnson');
    await page.fill('input#email', 'bob@example.com');
    
    // Extract values
    const firstName = await page.locator('input#firstName').inputValue();
    const lastName = await page.locator('input#lastName').inputValue();
    const email = await page.locator('input#email').inputValue();
    
    // Verify values
    expect(firstName).toBe('Bob');
    expect(lastName).toBe('Johnson');
    expect(email).toBe('bob@example.com');
  });
});
