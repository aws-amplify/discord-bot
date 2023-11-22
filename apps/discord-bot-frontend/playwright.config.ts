import { defineConfig, devices } from '@playwright/test'
import { loadEnvVars } from './vite.config'
import { z } from 'zod'

loadEnvVars()

// define the base set of env vars needed to run tests
// tests that are opt-in (like webhook tests) should not have their env vars set here
const env_schema = z.object({
  TEST_HOST: z.string().default('http://localhost:3000/'),
  DISCORD_GUILD_ID: z.string(),
  // add more required env vars here as necessary
})
// ensure necessary env vars are available
export const env = env_schema.parse(process.env)

export default defineConfig({
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],
  workers: process.env.CI ? 1 : undefined,
  webServer: {
    reuseExistingServer: !process.env.CI,
    command: 'pnpm run preview',
    port: 3000,
  },
  projects: [
    {
      use: devices['Desktop Chrome'],
      retries: 0,
    },
  ],
  testDir: 'tests',
  testMatch: '**/*.test.ts',
  use: {
    baseURL: env.TEST_HOST,
  },
})
