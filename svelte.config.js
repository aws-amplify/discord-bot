import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import adapter from '@sveltejs/adapter-node'
import glob from 'fast-glob'
import preprocess from 'svelte-preprocess'
import { optimizeCarbonImports } from 'carbon-preprocess-svelte'
import { loadEnv } from 'vite'

// glob all ts files in src/ directory
const input = await glob('src/(discord)/**/!(*.d).ts')
// https://nodejs.org/api/esm.html#esm_no_json_module_loading
const pkg = JSON.parse(await readFile(resolve('package.json'), 'utf-8'))

/**
 * Load's environment variables for development
 * by default Vite's `loadEnv` will only load variables prefixed with "VITE_"
 */
export function loadEnvVars() {
  Object.assign(
    process.env,
    loadEnv('development', new URL('.', import.meta.url).pathname, [
      'DISCORD_',
      'GITHUB_',
      'DATABASE_',
    ])
  )
}

loadEnvVars()

function relative(path) {
  return new URL(path, import.meta.url).pathname
}

/** @type {import('vite').Plugin} */
export function BotServerPlugin(options) {
  return {
    name: 'bot-server-plugin',
    configureServer(server) {
      //
    },
  }
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [preprocess(), optimizeCarbonImports()],

  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: adapter(),

    files: {
      assets: relative('public'),
    },

    vite: {
      build: {
        target: 'es2022',
      },
      envDir: '.',
      define: {
        'import.meta.vitest': 'undefined',
      },
      plugins: [],
      resolve: {
        alias: {
          $discord: relative('./src/lib/discord'),
        },
      },
      rollupOptions: {
        external: Object.keys(pkg.dependencies),
        output: {
          inlineDynamicImports: false,
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
      },
    },
  },
}

export default config
