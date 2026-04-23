import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const isCi = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:3000',
    // Local: visible Chromium only. CI: headless (set CI=1, e.g. pnpm test:e2e:ci).
    headless: isCi,
    trace: isCi ? 'on-first-retry' : 'off',
    video: 'off',
    screenshot: isCi ? 'only-on-failure' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm --filter @theodore/playground exec rsbuild dev --port 3000',
    cwd: repoRoot,
    url: 'http://localhost:3000',
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
});
