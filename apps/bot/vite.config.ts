import * as fs from 'node:fs/promises'
import glob from 'fast-glob'
import { defineConfig, loadEnv } from 'vite'
import VitePluginDts from 'vite-plugin-dts'

const pkg = JSON.parse(
  await fs.readFile(new URL('package.json', import.meta.url).pathname, 'utf8')
)

const input = await glob('src/**/!(*.d).(js|ts)')
const isProduction = process.env.NODE_ENV === 'production'

if (!isProduction) {
  // load env vars for bot development
  Object.assign(
    process.env,
    loadEnv('development', new URL('../../', import.meta.url).pathname, [
      'DISCORD_',
      'DATABASE_',
    ])
  )
}

export default defineConfig({
  envDir: '../../',
  define: {
    'import.meta.vitest': 'undefined',
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: 'build',
    ssr: true,
    lib: {
      entry: './src/index.ts',
      name: 'hey-amplify',
      formats: ['es'],
      fileName: (format) => `[name].js`,
    },
    rollupOptions: {
      input,
      external: Object.keys(pkg.dependencies),
      output: {
        inlineDynamicImports: false,
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
  plugins: [VitePluginDts()],
  optimizeDeps: {
    exclude: ['@discordjs/rest'],
  },
})
