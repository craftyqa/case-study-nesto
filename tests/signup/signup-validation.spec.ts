import { test, expect } from "@playwright/test";
import { SignupPage } from "../pages/SignupPage";
import { validUser } from "../fixtures/signup.fixtures";
import { ACCOUNTS_API } from "../helpers/urls";
import { waitForAccountsResponse } from "../helpers/network";

test.describe("Signup Validation", () => {
  test("shows errors for all required fields when form is submitted empty", { tag: "@smoke" }, async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.submit();

    await expect(signupPage.errors.firstName()).toBeVisible();
    await expect(signupPage.errors.lastName()).toBeVisible();
    await expect(signupPage.errors.phone()).toBeVisible();
    await expect(signupPage.errors.email()).toBeVisible();
    await expect(signupPage.errors.password()).toBeVisible();
  });

  test("shows error when passwords do not match", { tag: "@sanity" }, async ({ page }) => {
    const signupPage = new SignupPage(page);
    const user = validUser();
    await signupPage.goto();
    await signupPage.fillForm(user);
    await signupPage.confirmPasswordInput().fill("DifferentPassword456");
    await signupPage.submit();

    await expect(signupPage.errors.confirmPassword()).toBeVisible();
  });

  const invalidEmails: [string, string][] = [
    ["no @ symbol", "userexample.com"],
    ["no domain", "user@"],
    ["no TLD", "user@example"],
    ["with spaces", "user @example.com"],
    ["double @", "user@@example.com"],
  ];

  for (const [description, email] of invalidEmails) {
    test(`shows email validation error — ${description}`, { tag: "@regression" }, async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();
      await signupPage.fillForm({ ...validUser(), email });
      await signupPage.submit();

      await expect(signupPage.errors.email()).toBeVisible();
    });
  }

  const invalidPasswords: [string, string][] = [
    ["fewer than 12 characters", "Short1A"],
    ["no uppercase letter", "testpassword123"],
    ["no number", "TestPasswordOnly"],
    ["only spaces", "            "],
  ];

  for (const [description, password] of invalidPasswords) {
    test(`shows password validation error — ${description}`, { tag: "@regression" }, async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();
      await signupPage.fillForm({ ...validUser(), password });
      await signupPage.submit();

      await expect(signupPage.errors.password()).toBeVisible();
    });
  }

  test("validation error clears after valid input is entered", { tag: "@regression" }, async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.submit();
    await expect(signupPage.errors.firstName()).toBeVisible();

    await signupPage.firstNameInput().fill("Test");
    await signupPage.firstNameInput().press("Tab");

    await expect(signupPage.errors.firstName()).not.toBeVisible();
  });

  test("API rejects a 256+ character email with a non-201 status", { tag: "@regression", retries: 2 }, async ({ page }) => {
    // No client-side length check exists; the API returns 422 for over-length emails
    const signupPage = new SignupPage(page);
    const longEmail = `${"a".repeat(248)}@b.com`;
    await signupPage.goto();
    await signupPage.fillForm({ ...validUser(), email: longEmail });

    const [response] = await Promise.all([
      waitForAccountsResponse(page),
      signupPage.submit(),
    ]);

    expect(response!.status()).not.toBe(201);
  });

  test("shows password validation error for a password over 32 characters", { tag: "@regression" }, async ({ page }) => {
    const signupPage = new SignupPage(page);
    const longPassword = "TestPassword1" + "A".repeat(20);
    await signupPage.goto();
    await signupPage.fillForm({ ...validUser(), password: longPassword });
    await signupPage.submit();

    await expect(signupPage.errors.password()).toBeVisible();
  });

  test("password complexity requirements hint is visible", { tag: "@sanity" }, async ({ page }) => {
    await new SignupPage(page).goto();
    // Matches both EN ("12 and 32") and FR ("12 et 32")
    await expect(page.getByText(/12.{1,10}32/)).toBeVisible();
  });

  const securityInputs: [string, string][] = [
    ["SQL injection", "'; DROP TABLE users;--"],
    ["XSS string", "<script>alert(1)</script>"],
  ];

  for (const [description, value] of securityInputs) {
    test(`first name field safely handles ${description}`, { tag: "@regression" }, async ({ page }) => {
      let alertFired = false;
      page.on("dialog", async (dialog) => {
        alertFired = true;
        await dialog.dismiss();
      });

      const signupPage = new SignupPage(page);
      await signupPage.goto();
      await signupPage.fillForm({ ...validUser(), firstName: value });
      await signupPage.submit();
      await page.waitForTimeout(500);

      expect(alertFired).toBe(false);
    });
  }
});
