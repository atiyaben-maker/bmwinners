import { expect, test } from '@playwright/test';

// Runs only against a live-mode build (LIVE_URL): every app page must require sign-in,
// keep the requested address in ?next=, and never leak data to a signed-out visitor.
const LIVE = process.env.LIVE_URL;

test.describe('live mode auth gate', () => {
  test.skip(!LIVE, 'set LIVE_URL to a live-mode build');

  for (const path of ['/', '/?m=4&tab=bankers', '/teams', '/learning', '/plan?doc=spec']) {
    test(`signed-out ${path} → /login`, async ({ page }) => {
      await page.goto(`${LIVE}${path}`);
      await expect(page).toHaveURL(/\/login/);
      if (path !== '/') expect(new URL(page.url()).searchParams.get('next')).toBe(path);
      await expect(page.getByRole('heading', { name: /כניסה ל-BM Winners/ })).toBeVisible();
      await expect(page.getByText('מכבי חיפה')).toHaveCount(0);
    });
  }

  test('forged session cookie is rejected', async ({ page, context }) => {
    await context.addCookies([{ name: 'sb-example-auth-token', value: 'base64-eyJhY2Nlc3NfdG9rZW4iOiJmYWtlIn0', url: LIVE! }]);
    await page.goto(`${LIVE}/learning`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('login: invalid email shows inline error; any valid email gets the same neutral answer', async ({ page }) => {
    await page.goto(`${LIVE}/login`);
    await page.getByLabel('כתובת אימייל').fill('not-an-email');
    await page.getByRole('button', { name: /שלחו לי מייל כניסה/ }).click();
    await expect(page.locator('#login-error')).toContainText('כתובת אימייל תקינה');
    await page.getByLabel('כתובת אימייל').fill('stranger@example.com');
    await page.getByRole('button', { name: /שלחו לי מייל כניסה/ }).click();
    await expect(page.locator('#login-status')).toContainText('אם הכתובת מורשית');
    await expect(page.getByLabel(/קוד בן 6 ספרות/)).toBeFocused();
  });

  test('magic-link landing without a code fails safely', async ({ page }) => {
    await page.goto(`${LIVE}/auth/confirm?next=//evil.example`);
    await expect(page).toHaveURL(/\/login\?error=link/);
    await expect(page.locator('#login-error')).toContainText('פג תוקף');
  });
});
