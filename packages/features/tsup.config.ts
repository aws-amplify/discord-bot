import { defineConfig } from 'tsup'

export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined',
  },
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'build',
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
})
