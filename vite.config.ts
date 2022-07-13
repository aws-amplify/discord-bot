import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, loadEnv } from 'vite'
import type { UserConfig } from 'vitest/config'

function relative(path) {
  return fileURLToPath(new URL(path, import.meta.url))
}

/**
 * Load's environment variables for development
 * by default Vite's `loadEnv` will only load variables prefixed with "VITE_"
 */
export function loadEnvVars() {
  Object.assign(
    process.env,
    loadEnv('development', relative('.'), [
      'DISCORD_',
      'GITHUB_',
      'DATABASE_',
      'NEXTAUTH_',
    ])
  )
}

const pkg = JSON.parse(await readFile(resolve('package.json'), 'utf-8'))

/**
 * Configuration to build the SvelteKit project.
 */
const app: UserConfig = {
  build: {
    target: 'es2022',
  },
  envDir: '.',
  define: {
    'import.meta.vitest': 'undefined',
  },
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $discord: relative('./src/lib/discord'),
    },
  },
}

/**
 * Configuration to build the server
 */
const server: UserConfig = {
  mode: 'production',
  build: {
    target: 'es2022',
    outDir: 'build',
    // do not erase Svelte-Kit build output
    emptyOutDir: false,
    lib: {
      // only build server and supporting code (i.e. the bot client)
      entry: './src/server.ts',
      name: 'server',
      formats: ['es'],
      fileName: () => `[name].js`,
    },
    rollupOptions: {
      // externalize dependencies and "./handler.js" for build
      external: Object.keys(pkg.dependencies).concat('./handler.js'),
      output: {
        inlineDynamicImports: false,
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    ssr: true,
  },
  resolve: {
    // use same helper aliases as Svelte-Kit
    alias: {
      $lib: relative('./src/lib'),
      $discord: relative('./src/lib/discord'),
    },
  },
}

export default defineConfig(({ mode }) => {
  // rely on Vite to load public env vars (i.e. prefixed with VITE_)
  loadEnvVars()

  let config = app
  if (mode === 'server') {
    config = server
  }
  config.test = {
    globals: true,
    environment: 'jsdom',
    includeSource: ['src/**/*.{js,ts,svelte}'],
    setupFiles: ['tests/setup/svelte-kit-routes.ts'],
  }
  return config
})
