import { resolve } from 'node:path'
import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import { optimizeCarbonImports } from 'carbon-preprocess-svelte'

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
      assets: resolve('public'),
    },
  },
}

export default config
