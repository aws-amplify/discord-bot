import { fileURLToPath } from 'node:url'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, loadEnv } from 'vite'

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
    loadEnv(mode, relative('../..'), [
      'DISCORD_',
      'GITHUB_',
      'DATABASE_',
      'NEXTAUTH_',
    ])
  )
}

// load secret environment variables for development
loadEnvVars()

export default defineConfig({
  build: {
    target: 'esnext',
  },
  envDir: '../..',
  define: {
    'import.meta.vitest': 'undefined',
  },
  plugins: [sveltekit()],
  ssr: {
    noExternal: process.env.NODE_ENV === 'production' ? ['@carbon/charts'] : []
  },
})
