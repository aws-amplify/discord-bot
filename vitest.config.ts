import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { loadEnvVars } from './svelte.config.js'

export default defineConfig(({ mode }) => {
  // only load environment variables when testing locally
  // e2e tests should be run with pre-defined environment variables
  if (mode !== 'e2e') loadEnvVars()
  return {
    plugins: [svelte({ hot: !process.env.VITEST })],
    // need to manually set aliases used in Svelte-Kit
    resolve: {
      alias: {
        $lib: resolve('src/lib'),
        $discord: resolve('src/lib/discord'),
        $output: resolve('./.svelte-kit/output'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      includeSource: ['src/**/*.{js,ts}'],
      setupFiles: ['tests/setup/svelte-kit-routes.ts'],
    },
  }
})
