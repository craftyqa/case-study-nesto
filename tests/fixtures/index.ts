import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { SignupPage } from '../pages/SignupPage';

type Fixtures = { signupPage: SignupPage };

export const test = base.extend<Fixtures>({
  signupPage: async ({ page }, use) => {
    // workerIndex offset prevents same-millisecond seed collisions across parallel workers
    const seed = Date.now() + base.info().workerIndex * 1_000_000_000;
    faker.seed(seed);

    // Always record the seed as an annotation so any test can be reproduced
    // from the HTML report, not just failures.
    const info = base.info();
    info.annotations.push({ type: 'faker-seed', description: String(seed) });

    const sp = new SignupPage(page);
    await sp.goto();
    await use(sp);

    // On failure, also print to stdout so the seed is immediately visible
    // in terminal output and CI logs without opening the HTML report.
    if (info.status !== info.expectedStatus) {
      console.log(`faker seed: ${seed}`);
    }
  },
});

export { expect } from '@playwright/test';
