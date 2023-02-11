import { resolve } from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import pkg from './package.json' assert { type: 'json' }
import type { UserConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const envDir = resolve('../../')

  // if we're in development (i.e. running vite-node), load env vars
  if (isDev) {
    process.env = loadEnv(mode, envDir, ['DISCORD_', 'GITHUB_'])
  }

  const config: UserConfig = {
    define: {
      'import.meta.vitest': undefined,
    },
    // resolve dotenv from project root
    envDir,
    envPrefix: 'VITE_',
    build: {
      sourcemap: isDev,
      lib: {
        entry: 'discord-bot.ts',
        name: 'discord-bot',
        formats: ['es'],
      },
      outDir: 'build',
      rollupOptions: {
        external: Object.keys(pkg.dependencies || {}),
      },
    },
    test: {
      globals: true,
      include: ['tests/**/*.test.ts'],
    },
  }

  return config
})
