import * as fs from 'node:fs/promises'
import { defineConfig, loadEnv } from 'vite'
import glob from 'fast-glob'

const pkg = JSON.parse(
  await fs.readFile(new URL('package.json', import.meta.url).pathname, 'utf8')
)

const input = await glob('src/**/!(*.d).(js|ts)')

// load env vars for bot development
Object.assign(
  process.env,
  loadEnv('development', new URL('../../', import.meta.url).pathname, [
    'DISCORD_',
  ])
)

export default defineConfig({
  // envPrefix: 'DISCORD_',
  envDir: '../../',
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
  plugins: [],
})
