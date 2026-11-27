import { expect, test } from '@playwright/test';

// Core Web Vitals budget (research: LCP ≤ 2.5 s, CLS ≤ 0.1) measured in the browser.
test('board meets LCP/CLS budget and ships modest JS', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium');
  let js = 0;
  page.on('response', async (r) => {
    if (r.url().endsWith('.js')) js += Number(r.headers()['content-length'] ?? (await r.body()).length);
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  const m = await page.evaluate(
    () =>
      new Promise<{ lcp: number; cls: number }>((resolve) => {
        let lcp = 0;
        let cls = 0;
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) =>
          l.getEntries().forEach((e) => {
            const s = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
            if (!s.hadRecentInput) cls += s.value;
          }),
        ).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve({ lcp, cls }), 1500);
      }),
  );
  console.log(`LCP ${Math.round(m.lcp)}ms · CLS ${m.cls.toFixed(3)} · JS ${(js / 1024).toFixed(0)} KB`);
  expect(m.lcp).toBeLessThan(2500);
  expect(m.cls).toBeLessThan(0.1);
  expect(js).toBeLessThan(450 * 1024);
});
