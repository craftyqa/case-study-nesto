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
| `@sanity` | 19 | Labels, UI elements, language switch, key validations, a11y basics, mobile layout | ~60s |
| `@regression` | 27 | All email/password variants, boundary values, security inputs, API edge cases, keyboard nav, WCAG | ~8m |
| `@visual` | 2 | Pixel snapshot tests — requires committed baselines, run separately (see below) | ~5s |

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
| `FR | Chrome` | `https://app.qa.nesto.ca/fr/` |
| `FR | Firefox` | `https://app.qa.nesto.ca/fr/` |
| `FR | Safari` | `https://app.qa.nesto.ca/fr/` |

No test code changes are needed to support both locales. The `SignupPage` uses a relative URL (`signup`) which Playwright resolves against the project's `baseURL` at runtime. Province selection uses the option `value` attribute (e.g. `QC`) rather than the visible label text, so it works regardless of language.

### Visual regression tests

Visual tests use a dedicated `@visual` tag and are excluded from the standard CI pass. They require OS-specific baseline images — CI runs on Linux, so baselines must also be generated on Linux. Locally generated baselines (with a `-windows.png` suffix) won't match what CI expects (`-linux.png`).

**To generate Linux-compatible baselines**, run the update step inside the CI environment and commit the output:

```bash
# Generate baselines (run in CI or a Linux environment)
npx playwright test --grep "@visual" --update-snapshots --project="EN | Chrome"

# Commit the generated snapshot files
git add tests/signup/signup-visual.spec.ts-snapshots/
git commit -m "chore: add visual test baselines"
```

Once baselines are committed, run visual tests with:

```bash
npx playwright test --grep "@visual"
```

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
│   ├── signup-mobile.spec.ts        # @sanity — layout at 375px, landscape (812×375), and 768px tablet
│   └── signup-visual.spec.ts        # @regression — pixel snapshot tests (requires baseline generation)
├── pages/
│   └── SignupPage.ts                # Page Object Model for the signup page
├── fixtures/
│   ├── index.ts                     # Extended Playwright test with signupPage fixture + faker seed
│   └── signup.fixtures.ts           # Test data factory (validUser())
├── helpers/
│   ├── urls.ts                      # All URL constants and patterns (ACCOUNTS_API, LOGIN_URL, etc.)
│   └── network.ts                   # waitForAccountsResponse() helper (WebKit-safe response capture)
```

### Page Object Model

`SignupPage` (`tests/pages/SignupPage.ts`) exposes all form locators, an `errors` object with all field-level error locators, and two actions:

- `fillForm(user)` — fills all form fields from a `SignupUser` object
- `submit()` — clicks the "Create your account" button

All locators use `data-testid` attributes for resilience against markup changes.

### Test Fixtures

`tests/fixtures/index.ts` exports an extended `test` object used by all spec files. It provides:

- **`signupPage` fixture** — instantiates `SignupPage` and navigates to `/signup` before each test body runs, eliminating per-test navigation boilerplate
- **Faker seed** — calls `faker.seed()` with a unique value before each test so all randomly generated data is reproducible

`validUser()` (`tests/fixtures/signup.fixtures.ts`) returns a `SignupUser` with a UUID-based unique email on every call, preventing duplicate-account failures across parallel workers.

### Reproducing a failure

When a test fails, the faker seed is printed directly to the terminal output:

```
faker seed: 1777768742430
```

It is also recorded as an annotation on every test and visible in the HTML report under the test's detail view (Annotations tab), regardless of pass or fail:

```bash
npx playwright show-report
# Open any test → Annotations → faker-seed
```

To reproduce the exact same data locally, call `faker.seed(<value>)` at the top of the test (or temporarily hardcode it in `tests/fixtures/index.ts`) before re-running.
