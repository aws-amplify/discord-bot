import { readFile, writeFile } from 'node:fs/promises'
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

/**
 * Configuration to build the SvelteKit project.
 */
const app: UserConfig = {
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
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $discord: relative('./src/lib/discord'),
    },
  },
  ssr: {
    noExternal: ['@carbon/charts', 'carbon-components'],
  },
}

/**
 * Configuration to build the server
 */
const server: UserConfig = {
  mode: 'production',
  define: {
    $handler: './handler.js',
    'import.meta.vitest': false,
  },
  build: {
    target: 'esnext',
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
        preserveModules: false, // don't generate build/lib
        preserveModulesRoot: 'src',
      },
    },
    ssr: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [
    {
      closeBundle: async () => {
        /**
         * @TODO - vite-plugin-server to remove separate server config
         * workaround for __SVELTEKIT_DEV__ artifact in output
         */
        const file = relative('./build/server.js')
        const contents = await readFile(file, 'utf-8')
        await writeFile(file, contents.replace('__SVELTEKIT_DEV__;', ''))
      },
    },
  ],
  resolve: {
    // use same helper aliases as Svelte-Kit
    alias: {
      $lib: relative('./src/lib'),
      $discord: relative('./src/lib/discord'),
      $app: relative('./.svelte-kit/runtime/app'), // TODO: cleanup - https://github.com/sveltejs/kit/blob/master/packages/kit/src/exports/vite/utils.js#L104,
    },
  },
}

export default defineConfig(({ mode }) => {
  let config = app
  if (mode === 'server' || mode === 'server-test') {
    config = server
  }
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
  }
  // `vitest` sets mode to test, load local environment variables for test
  if (mode === 'test' || mode === 'server-test') {
    loadEnvVars(mode)
  } else {
    // rely on Vite to load public env vars (i.e. prefixed with VITE_)
    loadEnvVars()
  }
  return config
})
