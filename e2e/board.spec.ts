import { expect, test } from '@playwright/test';

test('board: 16 rows in form order, sticky match column on the start (right) edge', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones get the compact list (tested below)');
  await page.goto('/');
  const rows = page.locator('#board-caption').locator('xpath=..').locator('tbody tr');
  await expect(rows).toHaveCount(16);
  await expect(rows.first().locator('th')).toContainText('1');
  const region = page.getByRole('region', { name: /16 משחקי הטופס/ });
  await expect(region).toHaveAttribute('tabindex', '0');
  const rb = (await region.boundingBox())!;
  const th = (await rows.first().locator('th').boundingBox())!;
  expect(Math.abs(rb.x + rb.width - (th.x + th.width))).toBeLessThan(3); // first column hugs the right edge
});

test('board: every probability bar has an accessible text equivalent summing to 100', async ({ page }) => {
  await page.goto('/');
  const bars = page.locator('img, [role=img]').filter({ visible: true }).and(page.getByRole('img', { name: /^סיכויים:/ }));
  await expect(bars).toHaveCount(16);
  for (const label of await bars.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''))) {
    const nums = [...label.matchAll(/(\d+)%/g)].map((m) => Number(m[1]));
    expect(nums).toHaveLength(3);
    expect(nums.reduce((a, b) => a + b, 0)).toBe(100);
  }
});

test('board: selecting a match opens both maps', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /מכבי חיפה/ }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/m=4/);
  const detail = page.locator('#match-detail');
  await expect(detail).toBeVisible();
  await expect(detail.getByRole('heading', { name: 'מפה ריאלית' })).toBeVisible();
  await expect(detail.getByRole('heading', { name: 'מפה רוחנית' })).toBeVisible();
  await detail.getByRole('link', { name: 'סגירת פרטי המשחק' }).click();
  await expect(page.locator('#match-detail')).toHaveCount(0);
});

test('side panel tabs: APG keyboard (RTL arrows), URL state survives reload', async ({ page }) => {
  await page.goto('/');
  const tabs = page.getByRole('tablist', { name: 'טבלת צד' }).getByRole('tab');
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowLeft'); // RTL: left = next
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page).toHaveURL(/tab=bankers/);
  await page.keyboard.press('End');
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/tab=alternatives/);
  await page.reload();
  await expect(page.getByRole('tablist', { name: 'טבלת צד' }).getByRole('tab').nth(2)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('50 הטורים הבאים');
});

test('20-column fill: 16 rows × 20 glyph cells, all valid', async ({ page }) => {
  await page.goto('/?tab=columns');
  const grid = page.locator('#fill-caption').locator('xpath=..');
  const rows = grid.locator('tbody tr');
  await expect(rows).toHaveCount(16);
  const cells = await grid.locator('tbody td').allTextContents();
  expect(cells).toHaveLength(320);
  cells.forEach((c) => expect(['1', 'X', '2']).toContain(c.trim()));
});

test('demo data is always labelled', async ({ page }) => {
  for (const path of ['/', '/teams', '/learning', '/plan']) {
    await page.goto(path);
    await expect(page.getByText('נתוני דמו').first()).toBeVisible();
  }
});

test('keyboard: skip link moves focus to main', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard pass on desktop');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'דלג לתוכן הראשי' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main/);
});

test('team card: gematria and research protocol', async ({ page }) => {
  await page.goto(`/teams?t=${encodeURIComponent('הפועל באר שבע')}`);
  await expect(page.getByText('פרוטוקול מחקר למחזור')).toBeVisible();
  await expect(page.getByText('ב×2 → שבתאי')).toBeVisible();
});

test('security headers and noindex', async ({ request }) => {
  const r = await request.get('/login');
  const h = r.headers();
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['x-robots-tag']).toContain('noindex');
  expect(h['x-powered-by']).toBeUndefined();
});

test('phone: compact list shows recommendation and bar without sideways scroll', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone only');
  await page.goto('/');
  const list = page.getByRole('list', { name: /16 משחקי הטופס/ });
  await expect(list.getByRole('listitem')).toHaveCount(16);
  const first = list.getByRole('listitem').first();
  await expect(first.getByRole('img', { name: /^סיכויים:/ })).toBeInViewport();
});
