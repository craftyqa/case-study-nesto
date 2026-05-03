const origin = new URL(process.env.BASE_URL ?? 'https://app.qa.nesto.ca').origin;

export const ACCOUNTS_API = `${origin}/api/accounts`;

export const SIGNUP_URL      = /signup/;
export const FR_SIGNUP_URL   = /\/fr\/signup/;
export const POST_SIGNUP_URL = /\/getaquote\/callback/;
export const LOGIN_URL       = /auth\.nesto\.ca\/login/;
export const TERMS_HREF      = /nesto\.ca/;
