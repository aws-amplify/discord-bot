import { resolve } from 'node:path'
import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/kit/vite'
import { optimizeCarbonImports } from 'carbon-preprocess-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess(), optimizeCarbonImports()],

  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: adapter(),
    env: {
      dir: '../../',
    },
    files: {
      assets: resolve('public'),
    },
    // https://kit.svelte.dev/docs/configuration#csp
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'img-src': ['self', 'data:', 'https://cdn.discordapp.com'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        // https://1.www.s81c.com/ is for Carbon fonts
        'font-src': ['self', 'https://1.www.s81c.com/', 'data:'],
      },
    },
  },
}

export default config
