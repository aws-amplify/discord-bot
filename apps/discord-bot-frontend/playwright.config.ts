import { loadEnvVars } from './vite.config'
import type { PlaywrightTestConfig } from '@playwright/test'

loadEnvVars()
process.env.IS_TEST = 'true'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'pnpm run build-app && pnpm run preview',
    port: 3000,
  },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
  use: {
    baseURL: 'http://localhost:3000/',
  },
}

export default config
