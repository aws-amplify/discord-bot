import * as path from 'node:path'
import glob from 'fast-glob'
import dts from 'vite-plugin-dts'
import type { Plugin, ResolvedConfig, UserConfig } from 'vite'
import type { InlineConfig as VitestConfig } from 'vitest'

export type VitePluginLibOptions = {
  /**
   * Entrypoint(s) of the library
   * @default "./src/index.ts"
   */
  entry: string
  /**
   * External depedencies
   */
  external?: string[]
  /**
   * override default tsconfig
   * @default "@hey-amplify/tsconfig/base.json"
   */
  tsconfig?: string
  /**
   * whether to enable DTS generation
   */
  dts?: boolean
}

export const VitePluginLib = (
  options: VitePluginLibOptions = {
    entry: './src/index.ts',
    dts: false,
  }
): Plugin => {
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-lib',
    enforce: 'pre',
    config: async (c, { command }) => {
      const { entry, external } = options

      const base: UserConfig & { test: VitestConfig } = {
        define: {
          'import.meta.vitest': 'undefined',
        },
        build: {
          emptyOutDir: true,
          target: 'esnext',
          sourcemap: true,
          outDir: 'build',
          ssr: true,
          lib: {
            entry: path.resolve(entry),
            formats: ['es'],
          },
          rollupOptions: {
            input: await glob('**/!(*.d).ts', {
              cwd: path.dirname(path.resolve(entry)).replace(c.root!, ''),
              absolute: true,
            }),
            external: Object.keys(external || {}),
            output: {
              inlineDynamicImports: false,
              preserveModules: true,
              preserveModulesRoot: 'src',
            },
          },
        },
        test: {
          includeSource: ['src/**/*.{js,ts}'],
        },
      }

      return base
    },
    configResolved: (c) => {
      config = c
    },
  }
}

export const lib = (options?: VitePluginLibOptions): Plugin[] =>
  [
    VitePluginLib(options),
    options?.dts &&
      dts({
        tsConfigFilePath: options?.tsconfig || path.resolve('tsconfig.json'),
        copyDtsFiles: true,
      }),
  ].filter(Boolean) as Plugin[]
export default lib
