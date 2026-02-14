Visual testing exercises

1. Run the visual capture tests to produce screenshots:

```bash
npx playwright test tests/day-4-visual --reporter=list
```

2. After verifying artifacts, create baseline snapshots by running:

```bash
npx playwright test tests/day-4-visual --update-snapshots
```

3. To compare changes in CI, run tests without `--update-snapshots` so diffs fail the build.

Tips:
- Keep dynamic content out of screenshots or mask it before capture.
- Use `expect(locator).toHaveScreenshot()` for focused comparisons.
