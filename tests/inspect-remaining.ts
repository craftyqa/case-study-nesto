import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const length of [254, 320, 500]) {
    const page = await browser.newPage();
    await page.goto('https://app.qa.nesto.ca/signup');
    await page.waitForLoadState('networkidle');

    const email = `${'a'.repeat(length - 6)}@b.com`;
    await page.getByTestId('first-name-input').fill('Test');
    await page.getByTestId('last-name-input').fill('User');
    await page.getByTestId('phoneInput').fill('5145551234');
    await page.getByTestId('region-select').selectOption({ value: 'QC' });
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill('TestPassword123');
    await page.getByTestId('passwordConfirmation-input').fill('TestPassword123');

    const responses: { status: number }[] = [];
    page.on('response', r => {
      if (r.url().includes('/api/accounts')) responses.push({ status: r.status() });
    });

    await page.getByTestId('submit-button').click();
    await page.waitForTimeout(2000);

    const emailError = await page.getByTestId('email-error-message-typography').isVisible();
    console.log(`Email length ${length}: api=${JSON.stringify(responses)}, emailError=${emailError}, url=${page.url().slice(0, 60)}`);
    await page.close();
  }

  await browser.close();
})();
