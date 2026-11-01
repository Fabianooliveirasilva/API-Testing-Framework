import { defineConfig } from '@playwright/test';

import { environment } from './src/config/environment.js';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: environment.baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    actionTimeout: environment.apiTimeout,
    trace: 'retain-on-failure'
  },
  outputDir: 'test-results'
});
