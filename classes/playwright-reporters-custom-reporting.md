# Playwright Reporters & Custom Test Reporting

## Goal
Learn how to use Playwright reporters for local/CI visibility and create a simple custom reporter for tailored output.

## Why this topic matters
- Reports are how teams understand failures quickly.
- Different environments need different formats (developer terminal vs CI artifacts).
- Custom reporters help you capture exactly the metrics your team cares about.

## Topics

### 1) Built-in reporters
- `list` → readable local output
- `dot` / `line` → compact terminal output
- `html` → rich visual report
- `json` / `junit` → machine-readable CI integrations

Run from CLI:
```bash
npx playwright test --reporter=list
npx playwright test --reporter=html
npx playwright test --reporter=junit
```

### 2) Reporter config
In `playwright.config.js`, you can configure one or many reporters.

### 3) Custom reporter basics
A custom reporter is a JS class with hooks like:
- `onBegin`
- `onTestEnd`
- `onEnd`

This lets you print custom summaries (for example pass/fail counts by category).

### 4) Practical workflow
- Use `list` locally while developing.
- Use `html` for debugging failed runs.
- Use `junit`/`json` in CI dashboards.
- Add custom reporter for project-specific metrics.

## Hands-on exercises
1. Run one test with `list`, `dot`, and `html` reporters.
2. Use the custom reporter in this class and inspect summary output.
3. Fail one test intentionally and observe how each reporter displays the failure.

## Commands
- Run class practice tests with custom reporter:
  - `npx playwright test tests/reporting/1-reporters-custom-reporting.spec.js --project=chromium --reporter=./reporters/learning-summary-reporter.js`
- Open HTML report (after a run using html reporter):
  - `npx playwright show-report`

## Key takeaway
Great reporting turns test output into actionable insight. Choose reporter format based on audience: developer, CI system, or leadership dashboard.
