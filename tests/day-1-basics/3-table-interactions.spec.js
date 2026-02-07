/**
 * DAY 1: TABLE & DATA INTERACTIONS
 * 
 * This file demonstrates working with tables and data elements:
 * - Loading and parsing table data
 * - Extracting data from rows and cells
 * - Counting and filtering data
 * - Working with dynamic content
 * 
 * RUN THIS TEST:
 * npm test -- tests/day-1-basics/3-table-interactions.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('DAY 1: Table & Data Interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the Tables section
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Tables' }).click();
    await page.waitForTimeout(300);
  });

  // TEST 1: Load Table Data
  // CONCEPT: Triggering dynamic content loading and waiting for it to render
  test('should load table data when button is clicked', async ({ page }) => {
    // Find and click the load button
    const loadButton = page.locator('button#loadTableBtn');
    await loadButton.click();
    
    // Wait for table to appear
    const table = page.locator('#dataTable');
    await expect(table).toBeVisible();
    
    // Empty message should disappear
    const emptyMessage = page.locator('#tableEmpty');
    await expect(emptyMessage).toBeHidden();
  });

  // TEST 2: Verify Table Structure
  // CONCEPT: Verifying table headers and structure
  test('should have correct table headers', async ({ page }) => {
    // Load table first
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Get all headers
    const headers = page.locator('table thead th');
    const headerCount = await headers.count();
    
    // Verify header count
    expect(headerCount).toBe(6);
    
    // Verify header texts
    const expectedHeaders = ['ID', 'Name', 'Email', 'Plan', 'Status', 'Action'];
    for (let i = 0; i < expectedHeaders.length; i++) {
      const header = headers.nth(i);
      await expect(header).toHaveText(expectedHeaders[i]);
    }
  });

  // TEST 3: Count Table Rows
  // CONCEPT: Counting and iterating through table rows
  test('should display correct number of rows', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Count rows
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    // Should have 5 sample rows
    expect(rowCount).toBe(5);
  });

  // TEST 4: Extract Data from First Row
  // CONCEPT: Extracting specific cell values from a table row
  test('should extract data from first row correctly', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Get first row
    const firstRow = page.locator('table tbody tr').first();
    
    // Extract cell values
    const cells = firstRow.locator('td');
    const id = await cells.nth(0).textContent();
    const name = await cells.nth(1).textContent();
    const email = await cells.nth(2).textContent();
    const plan = await cells.nth(3).textContent();
    
    // Verify values
    expect(id).toBe('1');
    expect(name).toContain('Alice');
    expect(email).toContain('alice');
    expect(plan).toContain('Premium');
  });

  // TEST 5: Extract All Table Data
  // CONCEPT: Extracting complete dataset from table
  test('should extract complete table data', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Extract all rows
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    const tableData = [];
    
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      
      const rowData = {
        id: await cells.nth(0).textContent(),
        name: await cells.nth(1).textContent(),
        email: await cells.nth(2).textContent(),
        plan: await cells.nth(3).textContent(),
        status: await cells.nth(4).textContent(),
      };
      
      tableData.push(rowData);
    }
    
    // Verify we have data
    expect(tableData).toHaveLength(5);
    
    // Verify first record structure
    expect(tableData[0]).toHaveProperty('id');
    expect(tableData[0]).toHaveProperty('name');
    expect(tableData[0]).toHaveProperty('email');
    expect(tableData[0]).toHaveProperty('plan');
  });

  // TEST 6: Filter Table by Plan - Premium
  // CONCEPT: Testing dynamic table filtering
  test('should filter table to show only premium plans', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Apply premium filter
    await page.locator('button', { hasText: 'Show Premium' }).click();
    await page.waitForTimeout(300);
    
    // Count visible rows
    const visibleRows = page.locator('table tbody tr:not([style*="display: none"])');
    const visibleCount = await visibleRows.count();
    
    // Should have 3 premium users
    expect(visibleCount).toBe(3);
  });

  // TEST 7: Filter Table by Plan - Free
  // CONCEPT: Testing another filter scenario
  test('should filter table to show only free plans', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Apply free filter
    await page.locator('button', { hasText: 'Show Free' }).click();
    await page.waitForTimeout(300);
    
    // Count visible rows
    const visibleRows = page.locator('table tbody tr:not([style*="display: none"])');
    const visibleCount = await visibleRows.count();
    
    // Should have 2 free users
    expect(visibleCount).toBe(2);
  });

  // TEST 8: Show All After Filtering
  // CONCEPT: Resetting filters to show all data
  test('should show all rows when "Show All" filter is clicked', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Apply filter
    await page.locator('button', { hasText: 'Show Premium' }).click();
    await page.waitForTimeout(300);
    
    // Reset to show all
    await page.locator('button', { hasText: 'Show All' }).click();
    await page.waitForTimeout(300);
    
    // Count visible rows
    const visibleRows = page.locator('table tbody tr:not([style*="display: none"])');
    const visibleCount = await visibleRows.count();
    
    // Should have all 5 rows
    expect(visibleCount).toBe(5);
  });

  // TEST 9: Click Edit Button in Table Row
  // CONCEPT: Interacting with buttons within table rows
  test('should handle edit button click in table row', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Get first row's edit button
    const firstRow = page.locator('table tbody tr').first();
    const editButton = firstRow.locator('button', { hasText: 'Edit' });
    
    // Verify button exists
    await expect(editButton).toBeVisible();
    
    // Click edit button
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Verify some action occurred (e.g., alert shown)
    // In this demo, it shows an alert message
  });

  // TEST 10: Search for Specific User in Table
  // CONCEPT: Finding specific rows based on criteria
  test('should find specific user in table', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Look for email containing "carol"
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    let found = false;
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const text = await row.textContent();
      
      if (text.includes('Carol')) {
        found = true;
        break;
      }
    }
    
    expect(found).toBe(true);
  });

  // TEST 11: Verify Table Data Types
  // CONCEPT: Validating data in table cells
  test('should have valid data types in table', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    const rows = page.locator('table tbody tr');
    const firstRow = rows.first();
    const cells = firstRow.locator('td');
    
    // Get ID (should be numeric)
    const idText = await cells.nth(0).textContent();
    const id = parseInt(idText);
    expect(isNaN(id)).toBe(false);
    
    // Get name (should be non-empty string)
    const name = await cells.nth(1).textContent();
    expect(name.trim().length).toBeGreaterThan(0);
    
    // Get email (should contain @)
    const email = await cells.nth(2).textContent();
    expect(email).toContain('@');
    
    // Get plan (should be Premium or Free)
    const plan = await cells.nth(3).textContent();
    expect(['Premium', 'Free']).toContain(plan.trim());
  });

  // TEST 12: Table Row Hovering Effect
  // CONCEPT: Verifying UI states and styles on hover
  test('should have hover effect on table rows', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    const firstRow = page.locator('table tbody tr').first();
    
    // Hover over row
    await firstRow.hover();
    
    // In CSS, there's a hover effect that changes background
    // This test confirms the element can be hovered
    await expect(firstRow).toBeVisible();
  });

  // TEST 13: Verify Table Contains Expected Users
  // CONCEPT: Verifying specific data presence in table
  test('should contain expected users in table', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    const expectedUsers = ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Emma Davis'];
    
    const tableContent = await page.locator('table tbody').textContent();
    
    for (const user of expectedUsers) {
      expect(tableContent).toContain(user);
    }
  });

  // TEST 14: Filter and Verify Row Count
  // CONCEPT: Combining filtering with counting
  test('should correctly count rows after filtering', async ({ page }) => {
    // Load table
    await page.locator('button#loadTableBtn').click();
    await page.waitForTimeout(300);
    
    // Test premium filter
    await page.locator('button', { hasText: 'Show Premium' }).click();
    await page.waitForTimeout(300);
    
    let visibleRows = page.locator('table tbody tr:not([style*="display: none"])');
    let count = await visibleRows.count();
    expect(count).toBe(3);
    
    // Test free filter
    await page.locator('button', { hasText: 'Show Free' }).click();
    await page.waitForTimeout(300);
    
    visibleRows = page.locator('table tbody tr:not([style*="display: none"])');
    count = await visibleRows.count();
    expect(count).toBe(2);
    
    // Test show all
    await page.locator('button', { hasText: 'Show All' }).click();
    await page.waitForTimeout(300);
    
    visibleRows = page.locator('table tbody tr:not([style*="display: none"])');
    count = await visibleRows.count();
    expect(count).toBe(5);
  });
});
