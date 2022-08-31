import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

/**
 * Gets environment variables required for Svelte-Kit build
 * by default Vite's `loadEnv` will only load variables prefixed with "VITE_"
 */
export function getSvelteKitEnvironmentVariables(env: string) {
  return loadEnv(env, fileURLToPath(new URL('../..', import.meta.url)), [
    'VITE_',
    'PUBLIC_',
  ])
}
