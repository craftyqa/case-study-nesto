import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const BASE_URL = process.env.BASE_URL ?? "https://app.qa.nesto.ca";

export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,
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

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
