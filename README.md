# case-study-nesto

Playwright end-to-end test suite for the nesto QA signup page, covering both the English and French versions of the site.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

## Setup

Install dependencies and download the Playwright browsers:

```bash
npm install
npx playwright install
```

## Running Tests

### By tag

Tests are tagged into three tiers. Use `--grep` to run a specific tier:

| Tag | Count | Purpose | Typical runtime |
|---|---|---|---|
| `@smoke` | 5 | Page loads, form renders, core signup flow, required-field errors | ~10s |
| `@sanity` | 17 | Labels, UI elements, language switch, key validations, a11y basics, mobile layout | ~15s |
| `@regression` | 23 | All email/password variants, boundary values, security inputs, API edge cases, keyboard nav, WCAG | ~40s |

```bash
npx playwright test --grep @smoke
npx playwright test --grep @sanity
npx playwright test --grep @regression
```

Tags can be combined with project filters:

```bash
npx playwright test --grep @smoke --project="EN | Chrome"
npx playwright test --grep @sanity --project="FR | Chrome"
```

### Full suite

Run all tests across all 6 projects (EN + FR × Chrome, Firefox, Safari):

```bash
npx playwright test
```

### Other filters

Run a specific test file:

```bash
npx playwright test tests/signup/signup.spec.ts
```

Run a single locale across all browsers:

```bash
npx playwright test --project="EN | Chrome" --project="EN | Firefox" --project="EN | Safari"
npx playwright test --project="FR | Chrome" --project="FR | Firefox" --project="FR | Safari"
```

Run a single project:

```bash
npx playwright test --project="EN | Chrome"
npx playwright test --project="FR | Chrome"
```

Run tests in headed mode (visible browser window):

```bash
npx playwright test --headed
```

Run a single test by name:

```bash
npx playwright test -g "account creation API returns 201"
```

## Locales

Each test runs against both the English and French versions of the site. This is configured via Playwright projects in `playwright.config.ts`:

| Project | Base URL |
|---|---|
| `EN | Chrome` | `https://app.qa.nesto.ca` |
| `EN | Firefox` | `https://app.qa.nesto.ca` |
| `EN | Safari` | `https://app.qa.nesto.ca` |
| `FR | Chrome` | `https://app.qa.nesto.ca/fr` |
| `FR | Firefox` | `https://app.qa.nesto.ca/fr` |
| `FR | Safari` | `https://app.qa.nesto.ca/fr` |

No test code changes are needed to support both locales. The `SignupPage` uses a relative URL (`/signup`) which Playwright resolves against the project's `baseURL` at runtime. Province selection uses the option `value` attribute (e.g. `QC`) rather than the visible label text, so it works regardless of language.

## Viewing the HTML Report

After a test run, open the report in your browser:

```bash
npx playwright show-report
```

## Project Structure

```
tests/
├── signup/
│   ├── signup.spec.ts               # @smoke + @sanity + @regression — core, labels, happy path, API
│   ├── signup-validation.spec.ts    # @smoke + @sanity + @regression — validation and error cases
│   ├── signup-accessibility.spec.ts # @sanity + @regression — aria, keyboard nav, WCAG contrast
│   └── signup-mobile.spec.ts        # @sanity — layout and field reachability at 375px viewport
├── pages/
│   └── SignupPage.ts                # Page Object Model for the signup page
├── fixtures/
│   └── signup.fixtures.ts           # Test data factory (validUser())
└── signup-test-plan.md              # Full test plan with all 87 test cases
```

### Page Object Model

`SignupPage` (`tests/pages/SignupPage.ts`) exposes all form locators, an `errors` object with all field-level error locators, and two actions:

- `fillForm(user)` — fills all form fields from a `SignupUser` object
- `submit()` — clicks the "Create your account" button

All locators use `data-testid` attributes for resilience against markup changes.

### Test Fixtures

`validUser()` (`tests/fixtures/signup.fixtures.ts`) returns a `SignupUser` with a unique email on every call (`Date.now()`), preventing duplicate-account failures on repeated runs.
