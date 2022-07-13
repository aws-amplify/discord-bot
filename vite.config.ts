import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

function relative(path) {
  return fileURLToPath(new URL(path, import.meta.url))
}

const pkg = JSON.parse(await readFile(resolve('package.json'), 'utf-8'))

/**
 * Configuration for building our server with Vite.
 * Leverages same codebase as frontend with aliases
 */
export default defineConfig({
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
      fileName: (format) => `[name].js`,
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
})
