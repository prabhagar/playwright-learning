/**
 * DAY 1: PLAYWRIGHT BASICS
 * 
 * This file demonstrates fundamental Playwright concepts:
 * - Navigating to pages
 * - Locating elements (by role, text, selector)
 * - Interacting with elements (click, fill, type)
 * - Assertions and validations
 * - Basic page inspection
 * 
 * RUN THIS TEST:
 * npm test -- tests/day-1-basics/1-basic-navigation.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 1: Basic Navigation & Page Interactions', () => {
  
  // CONCEPT: beforeEach hook runs before each test
  // This is useful for setup actions
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  // TEST 1: Page Title Verification
  // CONCEPT: Verifying page properties with assertions
  test('should load the home page with correct title', async ({ page }) => {
    // Get the page title
    const title = await page.title();
    
    // Assert the title matches expectations
    expect(title).toBe('Playwright Learning - Demo App');
    
    // Alternative: Use page.locator for more complex assertions
    const heading = page.locator('header h1');
    await expect(heading).toContainText('Playwright Learning');
  });

  // TEST 2: Verify Header Content
  // CONCEPT: Using locators to find and verify elements
  test('should display welcome message on home page', async ({ page }) => {
    // Locate the hero heading using CSS selector
    const heroHeading = page.locator('.hero h2');
    
    // Verify the element is visible
    await expect(heroHeading).toBeVisible();
    
    // Verify the text content
    await expect(heroHeading).toHaveText('Welcome to Playwright Testing!');
  });

  // TEST 3: Navigation Between Sections
  // CONCEPT: Clicking elements and verifying page changes
  test('should navigate to Forms section when clicked', async ({ page }) => {
    // Find the "Forms" navigation link
    const formsLink = page.locator('nav a', { hasText: 'Forms' });
    
    // Click the link
    await formsLink.click();
    
    // Wait for animation to complete
    await page.waitForTimeout(300);
    
    // Verify the Forms section is now visible
    const formsSection = page.locator('#forms');
    await expect(formsSection).toBeVisible();
    
    // Verify the heading is correct
    const heading = page.locator('#forms h2');
    await expect(heading).toHaveText('Form Testing');
  });

  // TEST 4: Navigate to Multiple Sections
  // CONCEPT: Chaining interactions and testing navigation flow
  test('should navigate through multiple sections', async ({ page }) => {
    const sections = ['forms', 'tables', 'modals', 'async', 'users'];
    
    for (const section of sections) {
      // Create the section name for display
      const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
      
      // Click the navigation link
      const navLink = page.locator(`nav a`, { hasText: sectionName });
      await navLink.click();
      
      // Wait for animation
      await page.waitForTimeout(300);
      
      // Verify the section is visible
      const sectionElement = page.locator(`#${section}`);
      await expect(sectionElement).toBeVisible();
    }
  });

  // TEST 5: Verify All Cards in Home Section
  // CONCEPT: Counting elements and verifying collections
  test('should display 6 feature cards on home page', async ({ page }) => {
    // Go to home (already there from beforeEach, but shown here for clarity)
    await page.goto('/');
    
    // Count the cards ONLY in the active home section (not other sections)
    const homeSection = page.locator('#home.section.active');
    const cards = homeSection.locator('.grid .card');
    const count = await cards.count();
    
    // Verify we have 6 cards
    expect(count).toBe(6);
    
    // Verify each card has a heading
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const heading = card.locator('h3');
      await expect(heading).toBeVisible();
    }
  });

  // TEST 6: Button Visibility
  // CONCEPT: Verifying element visibility and attributes
  test('should have visible navigation buttons', async ({ page }) => {
    // Get all navigation buttons
    const navButtons = page.locator('nav a, nav button');
    const count = await navButtons.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify each is visible and enabled
    for (let i = 0; i < count; i++) {
      const button = navButtons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  // TEST 7: Get Text Content
  // CONCEPT: Extracting and verifying text from elements
  test('should extract text from hero section', async ({ page }) => {
    // Get text from paragraph
    const heroText = await page.locator('.hero p').first().textContent();
    
    console.log('Hero Text:', heroText);
    expect(heroText).toContain('demo application');
  });

  // TEST 8: Verify Footer
  // CONCEPT: Checking element presence and content
  test('should display footer with copyright information', async ({ page }) => {
    // Check if footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Verify footer text
    const footerText = await footer.textContent();
    expect(footerText).toContain('Playwright Learning Lab');
    expect(footerText).toContain('2025');
  });

  // TEST 9: Page Load Performance
  // CONCEPT: Measuring page load metrics
  test('should load home page quickly (< 3 seconds)', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Page loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  // TEST 10: Verify Page URL
  // CONCEPT: Checking page navigation and URLs
  test('should maintain correct URL on home page', async ({ page }) => {
    const url = page.url();
    expect(url).toContain('localhost:3000');
  });
});
