import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PAGES = [
  { name: 'board', path: '/' },
  { name: 'board-match', path: '/?m=4&tab=columns' },
  { name: 'board-bankers', path: '/?tab=bankers' },
  { name: 'board-alternatives', path: '/?tab=alternatives' },
  { name: 'teams', path: '/teams' },
  { name: 'team-card', path: `/teams?t=${encodeURIComponent('מכבי חיפה')}` },
  { name: 'learning', path: '/learning' },
  { name: 'plan', path: '/plan' },
  { name: 'plan-spec', path: '/plan?doc=spec' },
  { name: 'login', path: '/login' },
];

async function noPageOverflow(page: Page) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
  expect(r.sw, `page scrollWidth ${r.sw} > viewport ${r.w}`).toBeLessThanOrEqual(r.w);
}

for (const p of PAGES) {
  test(`${p.name}: RTL, no overflow, axe WCAG 2.2 AA, screenshot`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(p.path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    await noPageOverflow(page);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const summary = axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
    expect(summary, summary.join('\n')).toEqual([]);
    await page.screenshot({ path: `qa/screens/${info.project.name}/${p.name}.png`, fullPage: true });
    expect(errors, errors.join('\n')).toEqual([]);
  });
}
