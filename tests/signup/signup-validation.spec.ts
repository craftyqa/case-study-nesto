import { test, expect } from "../fixtures";
import { validUser } from "../fixtures/signup.fixtures";
import { waitForAccountsResponse } from "../helpers/network";
import { ACCOUNTS_API } from "../helpers/urls";

type ErrorKey = 'required' | 'phone' | 'email' | 'passwordMin' | 'passwordMax' | 'passwordComplex' | 'confirmPassword';

function expectedErrors(isFr: boolean): Record<ErrorKey, string> {
  return {
    required:        isFr ? 'Ce champ est obligatoire.' : 'The field is required',
    phone:           isFr ? 'Valeur invalide.' : 'Invalid value',
    email:           isFr ? 'Courriel invalide' : 'Invalid email',
    passwordMin:     isFr ? 'Minimum de 12 lettres requises' : 'Minimum of 12 letters required',
    passwordMax:     isFr ? 'Maximum de 32 lettres requises' : 'Maximum of 32 letters required',
    passwordComplex: isFr
      ? 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre'
      : 'Password must contain at least one uppercase letter, one lowercase letter and one number',
    confirmPassword: isFr ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match',
  };
}

test.describe("Signup Validation", () => {
  test("shows errors for all required fields when form is submitted empty", { tag: "@smoke" }, async ({ signupPage, baseURL }) => {
    const msg = expectedErrors((baseURL ?? '').includes('/fr'));
    await signupPage.submit();

    await expect(signupPage.errors.firstName()).toHaveText(msg.required);
    await expect(signupPage.errors.lastName()).toHaveText(msg.required);
    await expect(signupPage.errors.phone()).toHaveText(msg.phone);
    await expect(signupPage.errors.email()).toHaveText(msg.email);
    await expect(signupPage.errors.password()).toHaveText(msg.passwordMin);
  });

  test("shows error when passwords do not match", { tag: "@sanity" }, async ({ signupPage, baseURL }) => {
    const msg = expectedErrors((baseURL ?? '').includes('/fr'));
    await signupPage.fillForm(validUser());
    await signupPage.confirmPasswordInput().fill("DifferentPassword456");
    await signupPage.submit();

    await expect(signupPage.errors.confirmPassword()).toHaveText(msg.confirmPassword);
  });

  const invalidEmails: [string, string][] = [
    ["no @ symbol", "userexample.com"],
    ["no domain", "user@"],
    ["no TLD", "user@example"],
    ["with spaces", "user @example.com"],
    ["double @", "user@@example.com"],
  ];

  for (const [description, email] of invalidEmails) {
    test(`shows email validation error — ${description}`, { tag: "@regression" }, async ({ signupPage, baseURL }) => {
      const msg = expectedErrors((baseURL ?? '').includes('/fr'));
      await signupPage.fillForm({ ...validUser(), email });
      await signupPage.submit();

      await expect(signupPage.errors.email()).toHaveText(msg.email);
    });
  }

  const invalidPasswords: [string, string, ErrorKey][] = [
    ["fewer than 12 characters", "Short1A",         "passwordMin"],
    ["no uppercase letter",      "testpassword123", "passwordComplex"],
    ["no number",                "TestPasswordOnly", "passwordComplex"],
    ["only spaces",              "            ",     "passwordComplex"],
  ];

  for (const [description, password, errorKey] of invalidPasswords) {
    test(`shows password validation error — ${description}`, { tag: "@regression" }, async ({ signupPage, baseURL }) => {
      const isFr = (baseURL ?? '').includes('/fr');
      await signupPage.fillForm({ ...validUser(), password });
      await signupPage.submit();

      await expect(signupPage.errors.password()).toHaveText(expectedErrors(isFr)[errorKey]);
    });
  }

  test("validation error clears after valid input is entered", { tag: "@regression" }, async ({ signupPage }) => {
    await signupPage.submit();
    await expect(signupPage.errors.firstName()).toBeVisible();

    await signupPage.firstNameInput().fill("Test");
    await signupPage.firstNameInput().press("Tab");

    await expect(signupPage.errors.firstName()).not.toBeVisible();
  });

  test("API rejects a 256+ character email with a non-201 status", { tag: "@regression", retries: 2 }, async ({ signupPage, page }) => {
    // No client-side length check exists; the API returns 422 for over-length emails
    const longEmail = `${"a".repeat(248)}@b.com`;
    await signupPage.fillForm({ ...validUser(), email: longEmail });

    const [response] = await Promise.all([
      waitForAccountsResponse(page),
      signupPage.submit(),
    ]);

    expect(response!.status()).not.toBe(201);
  });

  test("shows password validation error for a password over 32 characters", { tag: "@regression" }, async ({ signupPage, baseURL }) => {
    const msg = expectedErrors((baseURL ?? '').includes('/fr'));
    const longPassword = "TestPassword1" + "A".repeat(20);
    await signupPage.fillForm({ ...validUser(), password: longPassword });
    await signupPage.submit();

    await expect(signupPage.errors.password()).toHaveText(msg.passwordMax);
  });

  test("password complexity requirements hint is visible", { tag: "@sanity" }, async ({ signupPage, page }) => {
    // Matches both EN ("12 and 32") and FR ("12 et 32")
    await expect(page.getByText(/12.{1,10}32/)).toBeVisible();
  });

  const securityInputs: [string, string, 'firstName' | 'lastName'][] = [
    ["SQL injection", "'; DROP TABLE users;--", "firstName"],
    ["XSS string", "<script>alert(1)</script>", "firstName"],
    ["SQL injection", "'; DROP TABLE users;--", "lastName"],
    ["XSS string", "<script>alert(1)</script>", "lastName"],
  ];

  for (const [description, value, field] of securityInputs) {
    test(`${field} safely handles ${description}`, { tag: "@regression" }, async ({ signupPage, page }) => {
      let alertFired = false;
      page.on("dialog", async (dialog) => {
        alertFired = true;
        await dialog.dismiss();
      });

      // Capture API response non-blocking: some inputs (e.g. XSS) are stripped
      // client-side so no request is ever sent; others (e.g. SQL injection) reach
      // the API and are stored as literal strings.
      let apiStatus: number | null = null;
      page.on("response", res => {
        if (res.url() === ACCOUNTS_API && res.request().method() === "POST")
          apiStatus = res.status();
      });

      await signupPage.fillForm({ ...validUser(), [field]: value });
      await signupPage.submit();
      await page.waitForLoadState("load");

      expect(alertFired).toBe(false);

      // When the input reached the API, the server must not have crashed
      if (apiStatus !== null) {
        expect(apiStatus).toBeLessThan(500);
      }

      // The payload must not be present as an injected executable script element
      await expect(page.locator("script").filter({ hasText: /alert\(/ })).toHaveCount(0);
    });
  }
});
