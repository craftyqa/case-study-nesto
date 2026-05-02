import { Page } from '@playwright/test';
import { SignupUser } from '../fixtures/signup.fixtures';

export class SignupPage {
  readonly url = 'signup';

  readonly firstNameInput = () => this.page.getByTestId('first-name-input');
  readonly lastNameInput = () => this.page.getByTestId('last-name-input');
  readonly phoneInput = () => this.page.getByTestId('phoneInput');
  readonly provinceSelect = () => this.page.getByTestId('region-select');
  readonly emailInput = () => this.page.getByTestId('email-input');
  readonly passwordInput = () => this.page.getByTestId('password-input');
  readonly confirmPasswordInput = () => this.page.getByTestId('passwordConfirmation-input');
  readonly agreementCheckbox = () => this.page.getByTestId('agreement-checkbox');
  readonly submitButton = () => this.page.getByTestId('submit-button');

  readonly errors = {
    firstName: () => this.page.getByTestId('first-name-error-message-typography'),
    lastName: () => this.page.getByTestId('last-name-error-message-typography'),
    phone: () => this.page.getByTestId('phone-error-message-typography'),
    province: () => this.page.getByTestId('region-error-message-typography'),
    email: () => this.page.getByTestId('email-error-message-typography'),
    password: () => this.page.getByTestId('password-error-message-typography'),
    confirmPassword: () => this.page.getByTestId('passwordConfirmation-error-message-typography'),
  };

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(this.url);
  }

  async fillForm(user: SignupUser) {
    // click() before fill() ensures React's synthetic focus/change events fire
    // correctly in WebKit, where fill() alone does not always trigger them.
    await this.firstNameInput().click();
    await this.firstNameInput().fill(user.firstName);
    await this.lastNameInput().click();
    await this.lastNameInput().fill(user.lastName);
    await this.phoneInput().click();
    await this.phoneInput().fill(user.phone);
    await this.provinceSelect().selectOption({ value: user.region });
    await this.emailInput().click();
    await this.emailInput().fill(user.email);
    await this.passwordInput().click();
    await this.passwordInput().fill(user.password);
    await this.confirmPasswordInput().click();
    await this.confirmPasswordInput().fill(user.password);
  }

  async submit() {
    await this.submitButton().click();
  }
}
