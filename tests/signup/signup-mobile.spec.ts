import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';

test.describe('Signup Page — Mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('page has no horizontal overflow at 375px', { tag: '@sanity' }, async ({ page }) => {
    await new SignupPage(page).goto();

    const hasHorizontalOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );

    expect(hasHorizontalOverflow).toBe(false);
  });

  test('all form fields and submit button are visible and enabled at 375px', { tag: '@sanity' }, async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    const fields = [
      signupPage.firstNameInput(),
      signupPage.lastNameInput(),
      signupPage.phoneInput(),
      signupPage.provinceSelect(),
      signupPage.emailInput(),
      signupPage.passwordInput(),
      signupPage.confirmPasswordInput(),
      signupPage.submitButton(),
    ];

    for (const field of fields) {
      await field.scrollIntoViewIfNeeded();
      await expect(field).toBeVisible();
      await expect(field).toBeEnabled();
    }
  });

});
