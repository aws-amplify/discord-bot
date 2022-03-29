/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  envPrefix: 'E2E_',
  build: {
    // we're not actually building anything, but we need to set `target` to use `import.meta`
    target: 'esnext',
  },
  test: {
    setupFiles: ['tests/setup.ts'],
  },
})
