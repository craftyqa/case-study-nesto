const origin = new URL(process.env.BASE_URL ?? 'https://app.qa.nesto.ca').origin;

export const ACCOUNTS_API = `${origin}/api/accounts`;
