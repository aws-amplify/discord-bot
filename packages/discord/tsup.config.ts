import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    define: {
      'import.meta.vitest': 'undefined',
    },
    entry: ['src/index.ts'],
    format: ['esm'],
    outDir: 'build',
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    // https://github.com/evanw/esbuild/issues/946#issuecomment-814703190
    banner: {
      js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);",
    },
    target: 'node18',
  }
})
