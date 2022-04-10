import * as fs from 'node:fs/promises'
import { defineConfig } from 'vite'
import glob from 'fast-glob'

const pkg = JSON.parse(
  await fs.readFile(new URL('package.json', import.meta.url).pathname, 'utf8')
)

const input = await glob('src/**/!(*.d).(js|ts)')

export default defineConfig({
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: 'build',
    ssr: true,
    lib: {
      entry: './src/index.ts',
      name: 'support',
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
