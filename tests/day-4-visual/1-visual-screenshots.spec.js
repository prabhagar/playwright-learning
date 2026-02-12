const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Simple visual capture tests — these save screenshots to `tests/day-4-visual/artifacts/`
// They are intentionally non-strict so they pass on first run and produce artifacts

const artifactsDir = path.join(__dirname, 'artifacts');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

test('capture home page screenshot', async ({ page, baseURL }) => {
  await page.goto(baseURL || 'http://localhost:3000/');
  const out = path.join(artifactsDir, 'home.png');
  await page.screenshot({ path: out, fullPage: true });
  expect(fs.existsSync(out)).toBeTruthy();
});

test('capture forms section screenshot', async ({ page, baseURL }) => {
  await page.goto(baseURL || 'http://localhost:3000/');
  await page.click('nav a:has-text("Forms")');
  const out = path.join(artifactsDir, 'forms.png');
  await page.screenshot({ path: out, fullPage: true });
  expect(fs.existsSync(out)).toBeTruthy();
});
