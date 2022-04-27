/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  envPrefix: 'DISCORD_',
  envDir: '../',
  build: {
    // we're not actually building anything, but we need to set `target` to use `import.meta`
    target: 'esnext',
  },
  test: {
    includeSource: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '../packages/**/src/**/*.{ts,js}',
    ],
    setupFiles: ['tests/setup.ts'],
  },
})
