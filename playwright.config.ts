import { defineConfig } from '@playwright/test';

// QA matrix from the research test plan: 360 / 768 / 1280 / 1920, Hebrew locale, Israel time.
// CHROME_PATH lets CI or a sandbox reuse an installed Chrome when browser downloads are blocked.
const launchOptions = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const base = { locale: 'he-IL', timezoneId: 'Asia/Jerusalem', launchOptions };

export default defineConfig({
  testDir: './e2e',
  outputDir: './qa/test-results',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3100', trace: 'retain-on-failure' },
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npx next start -p 3100', url: 'http://localhost:3100/login', reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'mobile-360', use: { ...base, viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: 'tablet-768', use: { ...base, viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'desktop-1280', use: { ...base, viewport: { width: 1280, height: 800 } } },
    { name: 'wide-1920', use: { ...base, viewport: { width: 1920, height: 1080 } } },
  ],
});
