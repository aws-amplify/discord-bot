import { defineConfig } from 'tsup'

export default defineConfig({
  define: {
    'import.meta.env.DEV': 'false',
    'import.meta.vitest': 'undefined',
  },
  entry: ['bot.ts'],
  format: ['esm'],
  outDir: 'bin',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
})
