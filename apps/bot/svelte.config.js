import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-node'
import { optimizeCarbonImports } from 'carbon-preprocess-svelte'
import { loadEnv } from 'vite'
// https://nodejs.org/api/esm.html#esm_no_json_module_loading
const pkg = JSON.parse(await readFile(resolve('package.json'), 'utf-8'))

const include = ['../../packages'].map(
  path => new URL(path + '/**/**/*.(js|ts)', import.meta.url).pathname
)

// load env vars for development
Object.assign(
  process.env,
  loadEnv('development', new URL('../../', import.meta.url).pathname, [
    'DISCORD_',
    'GITHUB_',
  ])
)

function relative(path) {
  return new URL(path, import.meta.url).pathname
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
      envDir: '../../',
      define: {
        'import.meta.vitest': 'undefined',
      },
      plugins: [],
      build: {
        target: 'es2022',
      },
    },
  },
}

export default config
