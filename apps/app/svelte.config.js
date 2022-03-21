import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import autoprefixer from 'autoprefixer'
import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static'
import ViteReload from 'vite-plugin-full-reload'
import { DiscordBotLayerPlugin } from 'vite-plugin-discord-bot-layer'
import { optimizeCarbonImports } from 'carbon-components-svelte/preprocess/index.js'
// https://nodejs.org/api/esm.html#esm_no_json_module_loading
const pkg = JSON.parse(await readFile(resolve('package.json'), 'utf-8'))

const include = [
  '../discord',
  '../handler-commands',
  '../handler-interact',
  '../handler-webhook',
  '../command-giverole',
  '../command-static',
].map(path => new URL(path + '/**/*.(js|ts)', import.meta.url).pathname)

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    optimizeCarbonImports(),
    preprocess({
      postcss: {
        plugins: [autoprefixer()],
      },
    }),
  ],

  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: adapter(),

    files: {
      assets: resolve('public'),
      routes: resolve('src/pages'),
    },

    vite: {
      plugins: [ViteReload(include), DiscordBotLayerPlugin()],
      resolve: {
        alias: {
          './runtimeConfig': './runtimeConfig.browser',
        },
      },
    },
  },
}

export default config
