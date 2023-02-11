import { defineConfig } from 'tsup'

export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined',
  },
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'build',
  external: ['./src/generated/client/index.js'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
})
