import { Page } from '@playwright/test';
import { ACCOUNTS_API } from './urls';

/**
 * Captures the POST /api/accounts response reliably across all browsers.
 *
 * waitForResponse misses the response in WebKit when the browser navigates
 * away immediately after the POST completes. Capturing via waitForRequest
 * (which fires before navigation) then resolving the response from the
 * request object avoids this race condition.
 */
export function waitForAccountsResponse(page: Page) {
  return page
    .waitForRequest(req => req.url() === ACCOUNTS_API && req.method() === 'POST')
    .then(req => req.response());
}
