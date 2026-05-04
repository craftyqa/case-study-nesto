import { test, expect } from '../fixtures';

test.describe('Signup Page — Mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('page has no horizontal overflow at 375px', { tag: '@sanity' }, async ({ signupPage, page }) => {
    const hasHorizontalOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );

    expect(hasHorizontalOverflow).toBe(false);
  });

  test('all form fields and submit button are visible and enabled at 375px', { tag: '@sanity' }, async ({ signupPage }) => {
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
      await expect.soft(field).toBeVisible();
      await expect.soft(field).toBeEnabled();
    }
  });

});

test.describe('Signup Page — Mobile Landscape (812×375)', () => {
  test.use({ viewport: { width: 812, height: 375 } });

  test('page has no horizontal overflow in landscape orientation', { tag: '@sanity' }, async ({ signupPage, page }) => {
    const hasHorizontalOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );

    expect(hasHorizontalOverflow).toBe(false);
  });

  test('all form fields and submit button are visible and enabled in landscape orientation', { tag: '@sanity' }, async ({ signupPage }) => {
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
      await expect.soft(field).toBeVisible();
      await expect.soft(field).toBeEnabled();
    }
  });

});

test.describe('Signup Page — Tablet (768px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('page has no horizontal overflow at 768px', { tag: '@sanity' }, async ({ signupPage, page }) => {
    const hasHorizontalOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );

    expect(hasHorizontalOverflow).toBe(false);
  });

  test('all form fields and submit button are visible and enabled at 768px', { tag: '@sanity' }, async ({ signupPage }) => {
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
      await expect.soft(field).toBeVisible();
      await expect.soft(field).toBeEnabled();
    }
  });

});
