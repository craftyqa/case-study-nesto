import { test, expect } from "../fixtures";
import { SignupPage } from "../pages/SignupPage";
import { faker } from "@faker-js/faker";
import { validUser, SignupUser } from "../fixtures/signup.fixtures";
import { ACCOUNTS_API, SIGNUP_URL, FR_SIGNUP_URL, POST_SIGNUP_URL, LOGIN_URL, TERMS_HREF } from "../helpers/urls";
import { waitForAccountsResponse } from "../helpers/network";

test.describe("Signup Page", () => {
  test(
    "successful signup returns 201 with correct account data and redirects",
    { tag: "@smoke" },
    async ({ signupPage, page }) => {
      const user = validUser();

      await test.step("fill form", () => signupPage.fillForm(user));

      const response = await test.step("submit and capture API response", async () => {
        const [resp] = await Promise.all([
          waitForAccountsResponse(page),
          signupPage.submit(),
        ]);
        return resp;
      });

      await test.step("verify API response body", async () => {
        expect(response!.status()).toBe(201);
        const { account } = await response!.json();
        expect(account.firstName).toBe(user.firstName);
        expect(account.lastName).toBe(user.lastName);
        expect(account.email).toBe(user.email);
        expect(account.phone).toContain(user.phone);
        expect(account.region).toBe(user.region);
        expect(account.leadDistributeConsentAgreement).toBe(false);
      });

      await test.step("verify redirect to post-signup destination", async () => {
        await expect(page).toHaveURL(POST_SIGNUP_URL);
      });
    },
  );

  // This test must own its navigation: the console listener must be registered
  // before the page loads, so the signupPage fixture cannot be used here.
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
    async ({ signupPage, page, baseURL }) => {
      const expected = (baseURL ?? "").includes("/fr")
        ? "nesto | Enregistrement"
        : "nesto | Signup";
      await expect(page).toHaveTitle(expected);
    },
  );

  test(
    "signup form is visible on load",
    { tag: "@smoke" },
    async ({ signupPage, page }) => {
      await expect(page.locator("form")).toBeVisible();
    },
  );

  test("nesto logo is displayed", { tag: "@sanity" }, async ({ signupPage, page }) => {
    await expect(page.locator('img[alt="nesto"]')).toBeVisible();
  });

  test(
    "form renders with correct labels, placeholders, and button text",
    { tag: "@sanity" },
    async ({ signupPage, page, baseURL }) => {
      const isFr = (baseURL ?? "").includes("/fr");

      await expect(page.getByTestId("first-name-input-placeholder")).toHaveText(isFr ? "Prénom" : "First name");
      await expect(page.getByTestId("last-name-input-placeholder")).toHaveText(isFr ? "Nom" : "Last name");
      await expect(page.getByTestId("email-input-placeholder")).toHaveText(isFr ? "Courriel" : "Email");
      await expect(page.getByTestId("password-input-placeholder")).toHaveText(isFr ? "Mot de passe" : "Password");
      await expect(page.getByTestId("passwordConfirmation-input-placeholder")).toHaveText(isFr ? "Confirmation du mot de passe" : "Confirm password");
      await expect(page.getByTestId("select-placeholder")).toHaveText(isFr ? "Province de l'achat" : "Province of purchase");
      await expect(page.getByTestId("input-placeholder")).toBeVisible(); // phone label — testid too generic for text check
      await expect(page.getByTestId("terms-link")).toBeVisible();
      await expect(page.getByTestId("login-link")).toBeVisible();
      await expect(signupPage.submitButton()).toHaveText(isFr ? "Créez votre compte" : "Create your account");

      const inputs = [
        signupPage.firstNameInput(),
        signupPage.lastNameInput(),
        signupPage.phoneInput(),
        signupPage.emailInput(),
        signupPage.passwordInput(),
        signupPage.confirmPasswordInput(),
      ];
      for (const input of inputs) {
        await expect.soft(input).toHaveAttribute("placeholder", /.+/);
      }
    },
  );

  // EN→FR only: skip on FR projects where the page already starts in French
  test(
    "labels render in French after clicking the language switch",
    { tag: "@sanity" },
    async ({ signupPage, page, baseURL }) => {
      test.skip(
        (baseURL ?? "").includes("/fr"),
        "EN→FR switch only applies to EN projects",
      );

      await page.getByTestId("header-language-switch").click();
      await page.waitForURL(FR_SIGNUP_URL);

      await expect(page.getByTestId("first-name-input-placeholder")).toHaveText("Prénom");
      await expect(page.getByTestId("last-name-input-placeholder")).toHaveText("Nom");
      await expect(page.getByTestId("email-input-placeholder")).toHaveText("Courriel");
      await expect(page.getByTestId("password-input-placeholder")).toHaveText("Mot de passe");
      await expect(page.getByTestId("passwordConfirmation-input-placeholder")).toHaveText("Confirmation du mot de passe");
      await expect(page.getByTestId("select-placeholder")).toHaveText("Province de l'achat");
    },
  );

  test(
    "all form fields are visible and enabled",
    { tag: "@smoke" },
    async ({ signupPage }) => {
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
        await expect.soft(field).toBeVisible();
        await expect.soft(field).toBeEnabled();
      }
    },
  );

  test(
    "name fields accept alphabetical, accented, hyphenated, and apostrophe characters",
    { tag: "@sanity" },
    async ({ signupPage }) => {
      await signupPage.firstNameInput().click();
      await signupPage.firstNameInput().fill("Mary-Jane O'Brien");
      await signupPage.lastNameInput().click();
      await signupPage.lastNameInput().fill("Tremblay-Côté");

      await expect(signupPage.firstNameInput()).toHaveValue("Mary-Jane O'Brien");
      await expect(signupPage.lastNameInput()).toHaveValue("Tremblay-Côté");
    },
  );

  test(
    "consent checkbox is unchecked by default and toggles correctly",
    { tag: "@sanity" },
    async ({ signupPage }) => {
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
      overrides: () => ({ email: `user+${faker.string.uuid()}@mail.example.com` }),
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
      async ({ signupPage, page }) => {
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
    async ({ signupPage, page }) => {
      // EN: /terms-of-services/  FR: /fr/conditions-d-utilisation/
      await expect(page.getByTestId("terms-link")).toHaveAttribute("href", TERMS_HREF);
    },
  );

  test(
    "submit button is disabled while the API request is in flight",
    { tag: "@regression" },
    async ({ signupPage, page }) => {
      await test.step("fill form", () => signupPage.fillForm(validUser()));

      const response = await test.step("submit — assert button disabled mid-flight", async () => {
        await page.route(ACCOUNTS_API, async (route) => {
          await expect(signupPage.submitButton()).toBeDisabled();
          await route.continue();
        });
        const [resp] = await Promise.all([
          waitForAccountsResponse(page),
          signupPage.submit(),
        ]);
        return resp;
      });

      expect(response!.status()).toBe(201);
    },
  );

  test(
    "double-clicking submit only sends one account creation request",
    { tag: "@regression", retries: 1 },
    async ({ signupPage, page }) => {
      let postCount = 0;
      page.on("request", (req) => {
        if (req.url() === ACCOUNTS_API && req.method() === "POST") postCount++;
      });

      await test.step("fill form", () => signupPage.fillForm(validUser()));

      await test.step("double-click submit", async () => {
        await Promise.all([
          waitForAccountsResponse(page),
          signupPage.submitButton().dblclick(),
        ]);
      });

      expect(postCount).toBe(1);
    },
  );

  test(
    "checking the consent checkbox sends leadDistributeConsentAgreement as true",
    { tag: "@regression" },
    async ({ signupPage, page }) => {
      await test.step("fill form and check consent checkbox", async () => {
        await signupPage.fillForm(validUser());
        await signupPage.agreementCheckbox().check();
      });

      const response = await test.step("submit and capture API response", async () => {
        const [resp] = await Promise.all([
          waitForAccountsResponse(page),
          signupPage.submit(),
        ]);
        return resp;
      });

      await test.step("verify consent flag in API response", async () => {
        expect(response!.status()).toBe(201);
        const { account } = await response!.json();
        expect(account.leadDistributeConsentAgreement).toBe(true);
      });
    },
  );

  test(
    "duplicate email returns 400 from the account creation API",
    { tag: "@regression" },
    async ({ signupPage, page, request }) => {
      const user = validUser();

      await test.step("create first account via API", async () => {
        const setupResponse = await request.post(ACCOUNTS_API, {
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: `+1${user.phone}`,
            region: user.region,
            language: "en",
            password: user.password,
            passwordSpecified: true,
            createdAt: "LOGIN",
            leadDistributeConsentAgreement: false,
          },
        });
        expect(setupResponse.status()).toBe(201);
      });

      const dupResponse = await test.step("submit duplicate email via UI", async () => {
        await signupPage.fillForm(user);
        const [resp] = await Promise.all([
          waitForAccountsResponse(page),
          signupPage.submit(),
        ]);
        return resp;
      });

      expect(dupResponse!.status()).toBe(400);
    },
  );

  test(
    "browser back button returns to the signup page",
    { tag: "@regression" },
    async ({ signupPage, page }) => {
      await test.step("verify Terms link opens new tab without leaving signup", async () => {
        const [termsPage] = await Promise.all([
          page.context().waitForEvent("page"),
          page.getByTestId("terms-link").click(),
        ]);
        await termsPage.close();
        await expect(page).toHaveURL(SIGNUP_URL);
      });

      await test.step("navigate away and return via back button", async () => {
        // about:blank creates a clean browser history entry that works reliably
        // across all browsers without depending on any external URL
        await page.goto("about:blank");
        await page.goBack();
        await page.waitForURL(SIGNUP_URL);
        await expect(page).toHaveURL(SIGNUP_URL);
      });
    },
  );

  test(
    "both login links navigate to the login page",
    { tag: "@sanity" },
    async ({ signupPage, page }) => {
      await test.step("header login button navigates to login", async () => {
        await page.getByTestId("header-login-button").click();
        await page.waitForURL(LOGIN_URL);
        await expect(page).toHaveURL(LOGIN_URL);
      });

      await test.step("footer login link navigates to login", async () => {
        await signupPage.goto();
        await page.getByTestId("login-link").scrollIntoViewIfNeeded();
        await page.getByTestId("login-link").click();
        await page.waitForURL(LOGIN_URL);
        await expect(page).toHaveURL(LOGIN_URL);
      });
    },
  );
});
