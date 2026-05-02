import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { SignupPage } from '../pages/SignupPage';

test.describe('Signup Accessibility', () => {

  test('all form fields have an accessible name', { tag: '@sanity' }, async ({ page }) => {
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
      signupPage.agreementCheckbox(),
    ];

    for (const field of fields) {
      await expect(field).toHaveAccessibleName(/.+/);
    }
  });

  test('field error messages have aria-live="polite"', { tag: '@sanity' }, async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.submitButton().waitFor();
    await signupPage.submit();

    const errors = [
      signupPage.errors.firstName(),
      signupPage.errors.lastName(),
      signupPage.errors.phone(),
      signupPage.errors.email(),
      signupPage.errors.password(),
    ];

    for (const error of errors) {
      await expect(error).toBeVisible();
      await expect(error).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('form fields receive focus in the correct tab order', { tag: '@regression' }, async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.firstNameInput().focus();
    await expect(signupPage.firstNameInput()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(signupPage.lastNameInput()).toBeFocused();

    // country-code prefix select is a tab stop between last name and phone number
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(signupPage.phoneInput()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(signupPage.provinceSelect()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(signupPage.emailInput()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(signupPage.passwordInput()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(signupPage.confirmPasswordInput()).toBeFocused();
  });

  test('page has no WCAG AA color contrast violations', { tag: '@regression' }, async ({ page }) => {
    await new SignupPage(page).goto();

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('form in validation error state has no critical or serious accessibility violations', { tag: '@regression' }, async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.submit();
    await expect(signupPage.errors.firstName()).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(blocking).toEqual([]);
  });

});
