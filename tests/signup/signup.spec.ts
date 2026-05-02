import { test, expect } from "@playwright/test";
import { SignupPage } from "../pages/SignupPage";
import { validUser, SignupUser } from "../fixtures/signup.fixtures";
import { ACCOUNTS_API } from "../helpers/urls";
import { waitForAccountsResponse } from "../helpers/network";

test.describe("Signup Page", () => {
  test(
    "successful signup returns 201 with correct account data and redirects",
    { tag: "@smoke" },
    async ({ page }) => {
      const signupPage = new SignupPage(page);
      const user = validUser();
      await signupPage.goto();
      await signupPage.fillForm(user);

      const [response] = await Promise.all([
        waitForAccountsResponse(page),
        signupPage.submit(),
      ]);

      expect(response!.status()).toBe(201);

      const { account } = await response!.json();
      expect(account.firstName).toBe(user.firstName);
      expect(account.lastName).toBe(user.lastName);
      expect(account.email).toBe(user.email);
      expect(account.phone).toContain(user.phone);
      expect(account.region).toBe(user.region);
      expect(account.leadDistributeConsentAgreement).toBe(false);

      await expect(page).not.toHaveURL(/\/signup$/);
    },
  );

  test(
    "page loads with HTTP 200 and no console errors",
    { tag: "@smoke" },
    async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      const [response] = await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes("/signup") && res.status() === 200,
        ),
        new SignupPage(page).goto(),
      ]);

      expect(response.status()).toBe(200);
      expect(consoleErrors).toHaveLength(0);
    },
  );

  test(
    "page title is correct",
    { tag: "@sanity" },
    async ({ page, baseURL }) => {
      await new SignupPage(page).goto();
      const expected = (baseURL ?? "").includes("/fr")
        ? "nesto | Enregistrement"
        : "nesto | Signup";
      await expect(page).toHaveTitle(expected);
    },
  );

  test(
    "signup form is visible on load",
    { tag: "@smoke" },
    async ({ page }) => {
      await new SignupPage(page).goto();
      await expect(page.locator("form")).toBeVisible();
    },
  );

  test("nesto logo is displayed", { tag: "@sanity" }, async ({ page }) => {
    await new SignupPage(page).goto();
    await expect(page.locator('img[alt="nesto"]')).toBeVisible();
  });

  test("all form labels are visible", { tag: "@sanity" }, async ({ page }) => {
    await new SignupPage(page).goto();

    await expect(
      page.getByTestId("first-name-input-placeholder"),
    ).toBeVisible();
    await expect(page.getByTestId("last-name-input-placeholder")).toBeVisible();
    await expect(page.getByTestId("phone-input-placeholder")).toBeVisible();
    await expect(page.getByTestId("select-placeholder")).toBeVisible();
    await expect(page.getByTestId("email-input-placeholder")).toBeVisible();
    await expect(page.getByTestId("password-input-placeholder")).toBeVisible();
    await expect(
      page.getByTestId("passwordConfirmation-input-placeholder"),
    ).toBeVisible();
    await expect(page.getByTestId("terms-link")).toBeVisible();
    await expect(page.getByTestId("login-link")).toBeVisible();
  });

  // EN-only: on FR projects the default language is already French
  test(
    "all labels render in English by default",
    { tag: "@sanity" },
    async ({ page, baseURL }) => {
      test.skip(
        (baseURL ?? "").includes("/fr"),
        "Default language on FR projects is French, not English",
      );

      await new SignupPage(page).goto();

      await expect(page.getByTestId("first-name-input-placeholder")).toHaveText(
        "First name",
      );
      await expect(page.getByTestId("last-name-input-placeholder")).toHaveText(
        "Last name",
      );
      await expect(page.getByTestId("email-input-placeholder")).toHaveText(
        "Email",
      );
      await expect(page.getByTestId("password-input-placeholder")).toHaveText(
        "Password",
      );
      await expect(
        page.getByTestId("passwordConfirmation-input-placeholder"),
      ).toHaveText("Confirm password");
      await expect(page.getByTestId("select-placeholder")).toHaveText(
        "Province of purchase",
      );
    },
  );

  // EN→FR only: skip on FR projects where the page already starts in French
  test(
    "labels render in French after clicking the language switch",
    { tag: "@sanity" },
    async ({ page, baseURL }) => {
      test.skip(
        (baseURL ?? "").includes("/fr"),
        "EN→FR switch only applies to EN projects",
      );

      await new SignupPage(page).goto();
      await page.getByTestId("header-language-switch").click();
      await page.waitForURL(/\/fr\/signup/);

      await expect(page.getByTestId("first-name-input-placeholder")).toHaveText(
        "Prénom",
      );
      await expect(page.getByTestId("last-name-input-placeholder")).toHaveText(
        "Nom",
      );
      await expect(page.getByTestId("email-input-placeholder")).toHaveText(
        "Courriel",
      );
      await expect(page.getByTestId("password-input-placeholder")).toHaveText(
        "Mot de passe",
      );
      await expect(
        page.getByTestId("passwordConfirmation-input-placeholder"),
      ).toHaveText("Confirmation du mot de passe");
      await expect(page.getByTestId("select-placeholder")).toHaveText(
        "Province de l'achat",
      );
    },
  );

  test(
    "all form fields are visible and enabled",
    { tag: "@smoke" },
    async ({ page }) => {
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
        await expect(field).toBeVisible();
        await expect(field).toBeEnabled();
      }
    },
  );

  test(
    "all input fields have placeholder text when empty",
    { tag: "@sanity" },
    async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      const inputs = [
        signupPage.firstNameInput(),
        signupPage.lastNameInput(),
        signupPage.phoneInput(),
        signupPage.emailInput(),
        signupPage.passwordInput(),
        signupPage.confirmPasswordInput(),
      ];

      for (const input of inputs) {
        await expect(input).toHaveAttribute("placeholder", /.+/);
      }
    },
  );

  test(
    "submit button label is correct",
    { tag: "@sanity" },
    async ({ page, baseURL }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();
      const expected = (baseURL ?? "").includes("/fr")
        ? "Créez votre compte"
        : "Create your account";
      await expect(signupPage.submitButton()).toHaveText(expected);
    },
  );

  test(
    "name fields accept alphabetical, accented, hyphenated, and apostrophe characters",
    { tag: "@sanity" },
    async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      await signupPage.firstNameInput().click();
      await signupPage.firstNameInput().fill("Mary-Jane O'Brien");
      await signupPage.lastNameInput().click();
      await signupPage.lastNameInput().fill("Tremblay-Côté");

      await expect(signupPage.firstNameInput()).toHaveValue(
        "Mary-Jane O'Brien",
      );
      await expect(signupPage.lastNameInput()).toHaveValue("Tremblay-Côté");
    },
  );

  test(
    "consent checkbox is unchecked by default and toggles correctly",
    { tag: "@sanity" },
    async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();
      const checkbox = signupPage.agreementCheckbox();

      await expect(checkbox).not.toBeChecked();
      await checkbox.check();
      await expect(checkbox).toBeChecked();
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    },
  );

  const boundaryUsers: Array<{
    label: string;
    overrides: () => Partial<SignupUser>;
  }> = [
    {
      label: "email with subdomain",
      overrides: () => ({ email: `user+${Date.now()}@mail.example.com` }),
    },
    {
      label: "password exactly 12 chars",
      overrides: () => ({ password: "TestPassw0rd" }),
    },
    {
      label: "password exactly 31 chars (max boundary)",
      overrides: () => ({ password: "TestPassword1" + "a".repeat(18) }),
    },
  ];

  for (const { label, overrides } of boundaryUsers) {
    test(
      `signup succeeds with ${label}`,
      { tag: "@regression" },
      async ({ page }) => {
        const signupPage = new SignupPage(page);
        await signupPage.goto();
        await signupPage.fillForm({ ...validUser(), ...overrides() });

        const [response] = await Promise.all([
          waitForAccountsResponse(page),
          signupPage.submit(),
        ]);

        expect(response!.status()).toBe(201);
      },
    );
  }

  test(
    "Terms of Service link points to nesto.ca",
    { tag: "@sanity" },
    async ({ page }) => {
      await new SignupPage(page).goto();
      // EN: /terms-of-services/  FR: /fr/conditions-d-utilisation/
      await expect(page.getByTestId("terms-link")).toHaveAttribute(
        "href",
        /nesto\.ca/,
      );
    },
  );

  test(
    "submit button is disabled while the API request is in flight",
    { tag: "@regression" },
    async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();
      await signupPage.fillForm(validUser());

      await page.route(ACCOUNTS_API, async (route) => {
        await expect(signupPage.submitButton()).toBeDisabled();
        await route.continue();
      });

      const [response] = await Promise.all([
        waitForAccountsResponse(page),
        signupPage.submit(),
      ]);
      expect(response!.status()).toBe(201);
    },
  );

  test(
    "double-clicking submit only sends one account creation request",
    { tag: "@regression", retries: 1 },
    async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      let postCount = 0;
      page.on("request", (req) => {
        if (req.url() === ACCOUNTS_API && req.method() === "POST") postCount++;
      });

      await signupPage.fillForm(validUser());

      await Promise.all([
        waitForAccountsResponse(page),
        signupPage.submitButton().dblclick(),
      ]);

      expect(postCount).toBe(1);
    },
  );

  test(
    "checking the consent checkbox sends leadDistributeConsentAgreement as true",
    { tag: "@regression" },
    async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();
      await signupPage.fillForm(validUser());
      await signupPage.agreementCheckbox().check();

      const [response] = await Promise.all([
        waitForAccountsResponse(page),
        signupPage.submit(),
      ]);

      expect(response!.status()).toBe(201);
      const { account } = await response!.json();
      expect(account.leadDistributeConsentAgreement).toBe(true);
    },
  );

  test(
    "duplicate email returns 400 from the account creation API",
    { tag: "@regression" },
    async ({ page, browser }) => {
      const user = validUser();

      // Create the account in a separate, isolated context so the main page
      // never gets an auth session and can load the signup form freely
      const isolatedCtx = await browser.newContext();
      const isolatedPage = await isolatedCtx.newPage();
      const isolatedSignup = new SignupPage(isolatedPage);
      await isolatedSignup.goto();
      await isolatedSignup.fillForm(user);
      await Promise.all([
        waitForAccountsResponse(isolatedPage),
        isolatedSignup.submit(),
      ]);
      await isolatedCtx.close();

      // Main page has no auth state — submit the same email and expect 400
      const signupPage = new SignupPage(page);
      await signupPage.goto();
      await signupPage.fillForm(user);
      const [dupResponse] = await Promise.all([
        waitForAccountsResponse(page),
        signupPage.submit(),
      ]);

      expect(dupResponse!.status()).toBe(400);
    },
  );

  test(
    "browser back button returns to the signup page",
    { tag: "@regression" },
    async ({ page }) => {
      await new SignupPage(page).goto();

      // Navigate away using the Terms link (stays within nesto.ca, so goBack() is reliable)
      const [termsPage] = await Promise.all([
        page.context().waitForEvent("page"),
        page.getByTestId("terms-link").click(),
      ]);
      await termsPage.close();

      // Terms opens in a new tab — the original page is still on signup
      await expect(page).toHaveURL(/signup/);

      // Now navigate away in the same tab and verify back works
      await page.goto("/");
      await page.waitForLoadState();
      await page.goBack();
      await page.waitForURL(/signup/);
      await expect(page).toHaveURL(/signup/);
    },
  );

  test(
    "both login links navigate to the login page",
    { tag: "@sanity" },
    async ({ page }) => {
      const loginUrl = /auth\.nesto\.ca\/login/;

      await new SignupPage(page).goto();
      await page.getByTestId("header-login-button").click();
      await page.waitForURL(loginUrl);
      await expect(page).toHaveURL(loginUrl);

      await new SignupPage(page).goto();
      await page.getByTestId("login-link").scrollIntoViewIfNeeded();
      await page.getByTestId("login-link").click();
      await page.waitForURL(loginUrl);
      await expect(page).toHaveURL(loginUrl);
    },
  );
});
