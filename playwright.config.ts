import 'dotenv/config';

import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || process.env.CI ? '3000' : '5173';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 15'] },
    },
  ],
  reporter: 'html',
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: process.env.CI ? 'pnpm start' : 'pnpm run dev',
    env: {
      NODE_ENV: 'test',
      PORT,
    },
    port: Number(PORT),
    reuseExistingServer: true,
    stderr: 'pipe',
    stdout: 'pipe',
  },
  workers: process.env.CI ? 1 : undefined,
});
