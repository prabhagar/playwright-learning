# Parallel Testing & Sharding

## Goal
Learn how to run Playwright tests faster using parallel execution, and how to split suites across CI machines using sharding.

## Why this class matters
- Large E2E suites get slow quickly.
- Parallel execution can reduce runtime dramatically.
- Sharding helps scale test runs in CI/CD by dividing test files across multiple jobs.

## Topics

### 1) Parallel execution basics
- Playwright can run multiple test files at the same time using workers.
- By default, tests in a **single file** run serially unless you opt in.
- In this project, `fullyParallel: true` is enabled in `playwright.config.js`.

### 2) File-level vs test-level parallelism
- **File-level parallelism**: multiple spec files run at once.
- **Test-level parallelism** in one file:
```js
test.describe.parallel('My parallel suite', () => {
  test('A', async () => {});
  test('B', async () => {});
});
```

### 3) Writing parallel-safe tests
- Keep tests independent (no shared mutable state).
- Use unique test data per test/worker.
- Avoid relying on execution order.
- Prefer fresh setup in each test (`beforeEach`) for isolation.

### 4) Worker-specific data
Use `testInfo.workerIndex` and timestamps to generate unique values:
```js
const unique = `user-${testInfo.workerIndex}-${Date.now()}`;
```

### 5) Sharding in CI
Split suite into shards so each CI job runs part of tests:
- Job 1: `--shard=1/3`
- Job 2: `--shard=2/3`
- Job 3: `--shard=3/3`

Example command:
```bash
npx playwright test --shard=1/2 --project=chromium
```

## Hands-on exercises

1. Run a parallel suite and inspect worker output.
2. Add unique data generation in each test.
3. Run shard 1/2 and shard 2/2 separately; confirm all tests are covered.
4. Compare runtime: serial vs parallel.

## Commands
- Run practice spec:
  - `npx playwright test tests/parallel-testing/1-parallel-sharding.spec.js --project=chromium --reporter=list`
- Run only shard 1 of 2:
  - `npx playwright test tests/parallel-testing/1-parallel-sharding.spec.js --project=chromium --shard=1/2 --reporter=list`
- Run only shard 2 of 2:
  - `npx playwright test tests/parallel-testing/1-parallel-sharding.spec.js --project=chromium --shard=2/2 --reporter=list`

## Key takeaway
Fast suites come from good isolation + parallel design. Sharding is the natural next step for scaling in CI.
