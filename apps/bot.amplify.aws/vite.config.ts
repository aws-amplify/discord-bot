import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, loadEnv } from 'vite'
import { server } from '@hey-amplify/vite-plugin-server'
import type { UserConfig } from 'vitest/config'

function relative(path) {
  return fileURLToPath(new URL(path, import.meta.url))
}

/**
 * Load's environment variables for development
 * by default Vite's `loadEnv` will only load variables prefixed with "VITE_"
 */
export function loadEnvVars(mode = 'development') {
  Object.assign(
    process.env,
    loadEnv(mode, relative('.'), [
      'DISCORD_',
      'GITHUB_',
      'DATABASE_',
      'NEXTAUTH_',
    ])
  )
}

const pkg = JSON.parse(await readFile(resolve('package.json'), 'utf-8'))

const base: UserConfig = {
  build: {
    target: 'esnext',
  },
  envDir: '.',
  define: {
    'import.meta.vitest': 'undefined',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    include: ['@carbon/charts'],
  },
  plugins: [sveltekit(), server({ dev: false })],
  resolve: {
    alias: {
      $discord: relative('./src/lib/discord'),
    },
  },
  ssr: {
    noExternal: ['@carbon/charts', 'carbon-components'],
  },
}

export default defineConfig(({ mode }) => {
  const config = base
  // apply general test config
  config.test = {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.ts'],
    exclude: ['tests/setup/**/*.ts', 'tests/mock/**/*.ts'],
    includeSource: ['src/**/*.{js,ts,svelte}'],
    setupFiles: [
      'tests/setup/svelte-kit-routes.ts',
      'tests/setup/seed.ts',
      'tests/setup/github-secrets-enabled.ts',
    ],
    env: {
      SSR: 'true',
    },
  }
  // `vitest` sets mode to test, load local environment variables for test
  if (mode === 'test') {
    loadEnvVars(mode)
  } else {
    // rely on Vite to load public env vars (i.e. prefixed with VITE_)
    loadEnvVars()
  }
  return config
})
