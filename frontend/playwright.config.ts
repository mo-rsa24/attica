import { defineConfig, devices } from '@playwright/test';

const FRONTEND_PORT = 5173;
const BACKEND_PORT = 8000;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '.',
      port: FRONTEND_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    // Backend is expected to be running on :8000 already (daphne or runserver).
    // Before the first run, make sure you've executed: `python manage.py seed_e2e`.
    // We don't auto-start it here because the venv path differs across WSL/Windows setups.
    {
      command: 'node -e "console.log(\'using existing backend on :8000\')"',
      cwd: '.',
      port: BACKEND_PORT,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
