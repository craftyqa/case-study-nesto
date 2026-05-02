import { test as base, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';

type Fixtures = { signupPage: SignupPage };

export const test = base.extend<Fixtures>({
  signupPage: async ({ page }, use) => {
    const sp = new SignupPage(page);
    await sp.goto();
    await use(sp);
  },
});

export { expect } from '@playwright/test';
