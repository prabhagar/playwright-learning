# Authentication & Session Management

## Goal
Learn how to test login flows efficiently in Playwright and reuse authenticated sessions with `storageState`.

## Why this class matters
- Real-world apps often require login before testing core features.
- Repeating UI login in every test is slow and flaky.
- `storageState` lets you log in once and reuse that session across many tests.

## Topics

### 1) Authentication strategies in Playwright
- **UI login**: fill username/password and click login button.
- **Session reuse**: save authenticated browser state (cookies + localStorage).
- **Fast test setup**: start tests already signed in.

### 2) `storageState` basics
- Save state:
```js
await context.storageState({ path: 'tests/.auth/adminStorageState.json' });
```
- Reuse state:
```js
test.use({ storageState: 'tests/.auth/adminStorageState.json' });
```

### 3) Manual context pattern
Useful when you want fine control in one test:
```js
const context = await browser.newContext();
const page = await context.newPage();
// login...
await context.storageState({ path: statePath });

const authed = await browser.newContext({ storageState: statePath });
const authedPage = await authed.newPage();
```

### 4) Good practices
- Keep auth files in `tests/.auth/`.
- Don’t commit sensitive real credentials.
- Regenerate state when auth logic changes.
- Prefer one dedicated auth setup step + many fast authenticated tests.

## Hands-on exercises

1. **Login once, save state**
   - Open `/login`
   - Login with demo credentials: `admin / password`
   - Save session to a state file

2. **Reuse authenticated state**
   - Create a new context with `storageState`
   - Go to `/`
   - Verify logout button is visible

3. **Negative exercise (optional)**
   - Attempt login with wrong credentials
   - Verify alert appears with invalid credentials message

## Commands
- Run practice spec for this class:
  - `npx playwright test tests/fixtures-locators/6-auth-session-reuse.spec.js --project=chromium --reporter=list`

## Key takeaway
`storageState` is one of the biggest speed boosters in end-to-end suites: authenticate once, reuse everywhere.
