import { resolve } from 'node:path'
import { defineConfig } from 'tsup'
import { loadEnv } from 'vite'

// this isn't being used, but it's here to show that it's possible
// discord package will need to migrate away from import.meta.env to build with tsup

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const envDir = resolve('../../')
  return {
    // statically replace 'import.meta.env' with actual values
    // define: loadEnv(mode, envDir, 'VITE_'),
    env: isDev && loadEnv(mode, envDir, ['DISCORD_', 'GITHUB_']),
    entry: ['discord-bot.ts'],
    format: ['esm'],
    outDir: 'build',
    dts: false,
    splitting: false,
    sourcemap: isDev,
    minify: !isDev,
    clean: true,
    target: 'node18',
  }
})
