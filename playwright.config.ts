import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "https://app.qa.nesto.ca";

export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  // 4 workers locally and on CI — tests are isolated (UUID emails, no shared state).
  // When the suite grows past ~150 tests, add sharding instead:
  //   npx playwright test --shard=1/3  (split across 3 matrix jobs in the workflow)
  //   npx playwright merge-reports     (merge shard artifacts into one HTML report)
  workers: 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers × locales */
  projects: [
    {
      name: "EN | Chrome",
      use: { ...devices["Desktop Chrome"], baseURL: BASE_URL },
    },
    {
      name: "EN | Firefox",
      use: { ...devices["Desktop Firefox"], baseURL: BASE_URL },
    },
    {
      name: "EN | Safari",
      use: { ...devices["Desktop Safari"], baseURL: BASE_URL },
    },
    {
      name: "FR | Chrome",
      use: { ...devices["Desktop Chrome"], baseURL: `${BASE_URL}/fr/` },
    },
    {
      name: "FR | Firefox",
      use: { ...devices["Desktop Firefox"], baseURL: `${BASE_URL}/fr/` },
    },
    {
      name: "FR | Safari",
      use: { ...devices["Desktop Safari"], baseURL: `${BASE_URL}/fr/` },
    },
  ],

});
