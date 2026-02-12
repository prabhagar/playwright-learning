# Class 4 — Visual testing & snapshots

## Goal
Introduce visual testing with Playwright: screenshots, snapshots, tolerances, and a simple workflow for visual regression checks.

## Topics
- What is visual testing and when to use it
- Capturing screenshots: `page.screenshot()` and `locator.screenshot()`
- Snapshot assertions: `expect(await page.screenshot()).toMatchSnapshot()` and `expect(locator).toHaveScreenshot()`
- Snapshot update workflow (`--update-snapshots`) and CI considerations
- Tolerances: `maxDiffPixelRatio`, `maxDiffPixels`

## Hands-on exercises
1. Capture baseline screenshots from the demo app and store them.
2. Modify a small UI style and observe snapshot mismatch.
3. Use `--update-snapshots` to accept intentional changes.

## Commands
- Run visual tests: `npx playwright test tests/day-4-visual --reporter=list`
- Update snapshots (create/accept baselines): `npx playwright test tests/day-4-visual --update-snapshots`

## Notes
- For stable snapshots avoid dynamic content (timestamps, randomized data). Mask or stub such areas before screenshot.
- In CI, fail the build on snapshot diffs; use `--update-snapshots` locally to accept changes.
