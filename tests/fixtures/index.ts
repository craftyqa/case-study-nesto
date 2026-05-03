import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { SignupPage } from '../pages/SignupPage';

type Fixtures = { signupPage: SignupPage };

export const test = base.extend<Fixtures>({
  signupPage: async ({ page }, use) => {
    const seed = Date.now();
    faker.seed(seed);

    const sp = new SignupPage(page);
    await sp.goto();
    await use(sp);

    // Attach the seed to the report only on failure so the exact data can be reproduced
    const info = base.info();
    if (info.status !== info.expectedStatus) {
      await info.attach('faker-seed', { body: String(seed), contentType: 'text/plain' });
    }
  },
});

export { expect } from '@playwright/test';
