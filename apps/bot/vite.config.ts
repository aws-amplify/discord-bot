import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { defineConfig } from 'vite'
import glob from 'fast-glob'
import app from './src/app'

const pkg = JSON.parse(
  await fs.readFile(new URL('package.json', import.meta.url).pathname, 'utf8')
)

const input = await glob('src/**/!(_*|*.d).(js|ts)')

/**
 * Adds the Discord bot routes to Vite dev server, mimicking API Gateway setup
 * @returns {import('vite').Plugin}
 */
export function DiscordBotPlugin() {
  return {
    name: 'discord-bot-layer-plugin',
    configureServer: async (server) => {
      server.middlewares.use(app)
    },
  }
}

export default defineConfig({
  envDir: '../',
  build: {
    target: 'esnext',
    outDir: 'build',
    ssr: true,
    lib: {
      entry: './src/app.ts',
      name: 'hey-amplify',
      formats: ['es'],
      fileName: (format) => `[name].js`,
    },
    rollupOptions: {
      input,
      external: Object.keys(pkg.dependencies),
      output: {},
    },
  },
  plugins: [DiscordBotPlugin()],
  server: {
    port: 3000,
  },
})
