import { test, expect } from '../fixtures';

// Run visual tests at a fixed viewport to keep snapshots stable across environments.
// First run: npx playwright test signup-visual --update-snapshots
// Subsequent runs: baselines are committed in tests/signup/signup-visual.spec.ts-snapshots/

test.describe('Signup Page — Visual', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('clean form state matches snapshot', { tag: '@visual' }, async ({ signupPage, page }) => {
    await expect(page).toHaveScreenshot('signup-clean.png');
  });

  test('form with validation errors matches snapshot', { tag: '@visual' }, async ({ signupPage, page }) => {
    await signupPage.submit();
    await expect(signupPage.errors.firstName()).toBeVisible();
    await expect(page).toHaveScreenshot('signup-errors.png');
  });

});
