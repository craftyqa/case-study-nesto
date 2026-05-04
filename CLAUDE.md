# case-study-nesto

Playwright E2E test suite for the nesto signup page, covering both English and French locales across Chrome, Firefox, and Safari.

## Commands

```bash
npx playwright test                                  # full suite (6 projects)
npx playwright test --project="EN | Chrome"          # single project
npx playwright test --grep @smoke                    # smoke tier only
npx playwright test --grep @sanity
npx playwright test --grep @regression
npx playwright show-report                           # open HTML report after a run
npx playwright test signup-visual --update-snapshots # regenerate visual baselines
```

## Architecture

### Test fixture — always import from `../fixtures`, never from `@playwright/test`

`tests/fixtures/index.ts` exports an extended `test` that all spec files must use:

```ts
import { test, expect } from '../fixtures';  // correct
import { test, expect } from '@playwright/test';  // wrong — breaks faker seeding
```

The `signupPage` fixture navigates to `/signup` before each test body runs. Tests that use it don't call `goto()` themselves. The one exception is `"page loads with HTTP 200 and no console errors"` in `signup.spec.ts` — it must own its navigation because it registers a console listener before the page loads.

The fixture also seeds `faker` per test and records the seed as a test annotation. On failure the seed is also printed to stdout so it appears in CI logs.

### Page Object Model

`tests/pages/SignupPage.ts` — all locators use `data-testid`. The `errors` object covers every field error except province (the select auto-selects Ontario, so no required-field error fires on empty submit).

### Test data factory

`validUser()` in `tests/fixtures/signup.fixtures.ts` generates a `SignupUser` with a UUID-based unique email (`faker.string.uuid()`). Do not use `Date.now()` for uniqueness — it collides under parallel workers.

## Domain knowledge

| Fact | Detail |
|---|---|
| Password max | **31 chars** (not 32 — confirmed against the API) |
| Post-signup redirect | `/getaquote/callback?code=...&state=...` |
| Phone format in API | Needs `+1` prefix — the UI's country-code selector adds it; `user.phone` does not include it |
| Phone label testid | `input-placeholder` (generic — the DOM has no field-specific testid for the phone label) |
| Province error | No client-side required-field error — the `<select>` auto-selects Ontario |
| WebKit network race | `waitForAccountsResponse()` uses `waitForRequest → .response()` to avoid a Safari race condition where `waitForResponse` misses the response after navigation |

## CI behaviour

- **Pull requests**: runs `@smoke` tests only (`--grep @smoke`)
- **Push to main**: runs the full suite
- **`BASE_URL`**: injected from the `vars.BASE_URL` repository variable; falls back to `https://app.qa.nesto.ca`

## Adding new tests

1. Import `test` and `expect` from `'../fixtures'`
2. Destructure `signupPage` to get a pre-navigated page; add `page` if you need Playwright's raw page object
3. Use `validUser()` for test data; spread-override individual fields: `{ ...validUser(), email: 'custom@example.com' }`
4. For tests that make direct API calls, use the `request` fixture and include `phone: \`+1${user.phone}\`` when constructing the payload
5. Import URL patterns from `'../helpers/urls'` — do not inline regex patterns for app URLs (`LOGIN_URL`, `POST_SIGNUP_URL`, `SIGNUP_URL`, `TERMS_HREF`, etc.)
6. For multi-phase tests (fill → submit → verify), wrap each phase in `test.step('description', async () => { ... })` so traces are readable
7. In tests that loop over a collection of locators and assert on each one, use `expect.soft()` so all failures are reported rather than stopping at the first

## Visual regression tests

Visual tests use the `@visual` tag and are **excluded from the standard CI pass** (`@smoke|@sanity|@regression`). They need OS-specific baselines — CI runs on Linux so baselines must be generated on Linux. Locally generated `-windows.png` baselines won't match CI's expected `-linux.png` paths.

Generate Linux baselines in CI or a Linux environment with `--update-snapshots`, commit the output, then run normally:

```bash
npx playwright test --grep "@visual" --update-snapshots --project="EN | Chrome"
git add tests/signup/signup-visual.spec.ts-snapshots/
git commit -m "chore: add visual test baselines"
```
