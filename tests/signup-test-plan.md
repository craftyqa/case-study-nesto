# Signup Page Test Plan

**URL:** https://app.qa.nesto.ca/signup  
**Framework:** Playwright + TypeScript

## Page Load & Layout

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 1 | Page loads successfully | Positive | HTTP 201, no console errors |
| 2 | Page title is correct | Positive | Title contains "nesto" or "Sign Up" |
| 3 | Signup form is visible | Positive | Form element is visible on load |
| 4 | Nesto logo is displayed | Positive | Logo image is visible |

---

## Labels & Static Text

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 5 | "First name" label is visible | Positive | Label text is "First name" (`first-name-input-placeholder`) |
| 6 | "Last name" label is visible | Positive | Label text is "Last name" (`last-name-input-placeholder`) |
| 7 | "Phone number" label is visible | Positive | Label text is "Phone number" (`input-placeholder`) |
| 8 | "Province of purchase" label is visible | Positive | Label text is "Province of purchase" (`select-placeholder`) |
| 9 | "Email" label is visible | Positive | Label text is "Email" (`email-input-placeholder`) |
| 10 | "Password" label is visible | Positive | Label text is "Password" (`password-input-placeholder`) |
| 11 | "Confirm password" label is visible | Positive | Label text is "Confirm password" (`passwordConfirmation-input-placeholder`) |
| 12 | Terms of Service link is visible in footer text | Positive | Footer reads "By clicking on 'Create your account', I agree and consent to the Terms of Service" with link (`terms-link`) |
| 13 | Marketing consent checkbox label text is visible | Positive | Checkbox (`agreement-checkbox`) label describes partner contact consent |
| 14 | "Already have an account?" text and Log in link are visible | Positive | Inline log in link (`login-link`) is present below the submit button |
| 15 | All labels render in English by default | Positive | Page loads in English without any user action |
| 16 | All labels render in French after switching language | Positive | Clicking `header-language-switch` re-renders labels in French |

---

## Form Fields

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 17 | First name field is visible and enabled | Positive | `first-name-input` accepts text input |
| 18 | Last name field is visible and enabled | Positive | `last-name-input` accepts text input |
| 19 | Phone number field is visible and enabled | Positive | `phoneInput` accepts numeric input |
| 20 | Province of purchase select is visible and enabled | Positive | `region-select` shows province options |
| 21 | Email field is visible and enabled | Positive | `email-input` accepts text input |
| 22 | Password field is visible, enabled, and masked | Positive | `password-input` type is "password" |
| 23 | Confirm password field is visible, enabled, and masked | Positive | `passwordConfirmation-input` type is "password" |
| 24 | Password visibility toggle shows/hides text | Positive | Toggle switches input type between "password" and "text" |
| 25 | First name accepts alphabetical characters | Positive | Value persists in field |
| 26 | Last name accepts alphabetical characters | Positive | Value persists in field |
| 27 | First name accepts hyphens and apostrophes (e.g., O'Brien, Mary-Jane) | Positive | Value persists in field |
| 28 | Last name accepts hyphens and apostrophes | Positive | Value persists in field |
| 29 | Email field accepts valid email format | Positive | Value persists in field |
| 30 | Tab order moves logically through all form fields | Positive | Focus advances: first name → last name → phone → province → email → password → confirm password |
| 31 | Placeholder text is present in each field when empty | Positive | All inputs show placeholder text before interaction |

---

## Positive Test Cases (Happy Path)

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 32 | Successful signup with all fields filled | Positive | `POST /api/accounts` returns 201, user redirected to next step |
| 33 | Successful signup without checking consent checkbox | Positive | Account created; consent checkbox (`agreement-checkbox`) is optional |
| 34 | Email with subdomain is accepted (e.g., user@mail.example.com) | Positive | No validation error |
| 35 | Password with exactly 12 characters (minimum) is accepted | Positive | No password error; meets minimum requirement |
| 36 | Password with exactly 32 characters (maximum) is accepted | Positive | No password error; meets maximum requirement |
| 37 | First name with accented characters is accepted (e.g., Élodie) | Positive | Value persists in field |
| 38 | Last name with accented characters is accepted (e.g., Tremblay) | Positive | Value persists in field |

---

## Negative Test Cases — Required Field Validation

> **File:** `tests/signup/signup-validation.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 39 | Submit with all fields empty | Negative | Validation errors shown for all required fields |
| 40 | Submit with First name empty | Negative | Error message displayed for `first-name-input` |
| 41 | Submit with Last name empty | Negative | Error message displayed for `last-name-input` |
| 42 | Submit with Province not selected | Negative | Error message displayed for `region-select` |
| 43 | Submit with Email empty | Negative | Error message displayed for `email-input` |
| 44 | Submit with Password empty | Negative | Error message displayed for `password-input` |
| 45 | Submit with Confirm password empty | Negative | Error message displayed for `passwordConfirmation-input` |
| 46 | Submit when Password and Confirm password do not match | Negative | Mismatch error shown on `passwordConfirmation-input` |
| 47 | Error messages disappear after valid input is entered | Positive | Error clears on corrected input |

---

## Negative Test Cases — Email Field

> **File:** `tests/signup/signup-validation.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 48 | Email without @ symbol (e.g., "userexample.com") | Negative | Validation error shown on `email-input` |
| 49 | Email without domain (e.g., "user@") | Negative | Validation error shown |
| 50 | Email without TLD (e.g., "user@example") | Negative | Validation error shown |
| 51 | Email with spaces (e.g., "user @example.com") | Negative | Validation error shown |
| 52 | Email with double @ (e.g., "user@@example.com") | Negative | Validation error shown |
| 53 | Email that already exists in the system | Negative | "Email already in use" or similar error shown |
| 54 | Very long email (256+ characters) | Negative | Validation error or field rejects input |

---

## Negative Test Cases — Password Field

> **File:** `tests/signup/signup-validation.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 55 | Password fewer than 12 characters | Negative | "Minimum of 12 letters required" error shown on `password-input` |
| 56 | Password more than 32 characters | Negative | Validation error or field rejects input beyond 32 chars |
| 57 | Password with only spaces | Negative | Validation error shown |
| 58 | Password missing an uppercase letter | Negative | Complexity error shown (rule: must contain one uppercase letter) |
| 59 | Password missing a number | Negative | Complexity error shown (rule: must contain one number) |
| 60 | Password complexity requirements are displayed to the user | Positive | Hint text visible: "12–32 characters, one uppercase, one lowercase, one number" |

---

## Negative Test Cases — Name Fields

> **File:** `tests/signup/signup-validation.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 61 | First name with numbers only (e.g., "12345") | Negative | Validation error shown |
| 62 | Last name with numbers only | Negative | Validation error shown |
| 63 | First name with SQL injection string (e.g., `'; DROP TABLE users;--`) | Negative | Input sanitized; no raw SQL reflected in DOM or response |
| 64 | First name with XSS string (e.g., `<script>alert(1)</script>`) | Negative | Input sanitized; script does not execute |
| 65 | First name exceeding maximum character limit | Negative | Field rejects input or shows character limit error |

---

## Consent Checkbox & Terms of Service

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 66 | Marketing consent checkbox (`agreement-checkbox`) is unchecked by default | Positive | Checkbox renders unchecked on page load |
| 67 | Checking the consent checkbox persists the checked state | Positive | Checkbox remains checked after click |
| 68 | Unchecking the consent checkbox persists the unchecked state | Positive | Checkbox returns to unchecked after second click |
| 69 | Submitting without checking consent checkbox succeeds | Positive | Consent is optional; `POST /api/accounts` still returns 201 |
| 70 | Terms of Service link (`terms-link`) navigates to correct page | Positive | Link opens the Terms of Service page |

---

## Submit Button

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 71 | Submit button (`submit-button`) is visible on page load | Positive | Button is present |
| 72 | Submit button label is "Create your account" | Positive | Button text matches exactly |
| 73 | Submit button shows loading state while request is in flight | Positive | Spinner or disabled state visible during submission |
| 74 | Double-clicking submit does not create duplicate accounts | Negative | Only one `POST /api/accounts` request is sent |

---

## API Validation

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 75 | Account creation API returns 201 on valid submission | Positive | `POST https://app.qa.nesto.ca/api/accounts` returns HTTP 201 |
| 76 | Account creation API returns an error for duplicate email | Negative | `POST /api/accounts` returns 4xx with error body |

---

## Navigation & Links

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 77 | Header login button (`header-login-button`) navigates to login page | Positive | User is redirected to login URL |
| 78 | Inline "Log in" link (`login-link`) navigates to login page | Positive | User is redirected to login URL |
| 79 | Browser back button returns to previous page | Positive | Navigation works as expected |

---

## Accessibility

> **File:** `tests/signup/signup-accessibility.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 80 | All form fields have associated labels or aria-labels | Positive | Screen reader compatible |
| 81 | Error messages are announced to screen readers (aria-live) | Positive | Errors are accessible |
| 82 | Form is fully navigable by keyboard only | Positive | No mouse required to complete signup |
| 83 | Color contrast meets WCAG AA standard for all text | Positive | Contrast ratio ≥ 4.5:1 |

---

## Responsive / Cross-Browser

> **File:** `tests/signup/signup.spec.ts`

| # | Test Case | Type | Expected Result |
|---|-----------|------|-----------------|
| 84 | Page renders correctly on Desktop Chrome | Positive | No layout breaks |
| 85 | Page renders correctly on Desktop Firefox | Positive | No layout breaks |
| 86 | Page renders correctly on Desktop Safari (WebKit) | Positive | No layout breaks |
| 87 | Page renders correctly on mobile viewport (375px) | Positive | Form is usable on small screens |

---

## Notes

- **Password rules (confirmed):** 12–32 characters, one uppercase letter, one lowercase letter, one number. Special characters are NOT required.
- **Consent checkbox (confirmed):** `agreement-checkbox` is an optional marketing consent field. The Terms of Service is agreed to implicitly by clicking "Create your account" — it is not gated on the checkbox.
- **Province of purchase:** A required `<select>` (`region-select`). Tests 42 and 32 depend on a valid province being selected.
- **Two login entry points:** `header-login-button` (top-right header) and `login-link` (below the submit button) — both should be tested independently (tests 77–78).
- Tests 48–54 (invalid email formats) should be driven by `test.each` in Playwright for efficiency.
- Tests 63–64 verify security hardening; assert that raw HTML/SQL is never reflected back in the DOM or API response.
- Language toggle tests (15–16) are confirmed via `header-language-switch` testid.
