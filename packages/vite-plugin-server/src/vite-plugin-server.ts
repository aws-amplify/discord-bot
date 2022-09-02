import * as path from 'node:path'
import express from 'express'
import colors from 'kleur'
import { build, type Plugin, type ResolvedConfig, type UserConfig } from 'vite'

export type VitePluginServerOptions = {
  /**
   * The path to the server file (express).
   * @default "./src/server.ts"
   */
  server?: string
}

export type ServerModule = {
  app: express.Express
}

const VitePluginServer = (options?: VitePluginServerOptions): Plugin => {
  const userServerFile = path.resolve(
    process.cwd(),
    options?.server ?? './src/server.ts'
  )
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-server',
    enforce: 'post',
    // config: (c) => {},
    configResolved: (c) => {
      config = c
    },
    configureServer: async (viteDevServer) => {
      viteDevServer.middlewares.use(async (req, res, next) => {
        try {
          const mod = (await viteDevServer.ssrLoadModule(
            `/@fs/${userServerFile}`
          )) as ServerModule

          /**
           * Create the internal server wrapper
           */
          const server = express()
          server.use((req, res, next) => {
            // @ts-expect-error - attach Vite server to "virtual" server
            req.viteServer = viteDevServer
            next()
          })

          server.use(mod.app)
          // @ts-expect-error - express.handle exists
          server.handle(req as any, res)
          if (!res.writableEnded) {
            next()
          }
        } catch (error) {
          viteDevServer.ssrFixStacktrace(error)
          process.exitCode = 1
          next(error)
        }
      })
    },
    closeBundle: async () => {
      // we want to run _after_ SvelteKit's adapter runs successfully
      // SvelteKit writes to .svelte-kit on `writeBundle`, and the adapter runs on `closeBundle`
      // we enforce this plugin on `post` to run after SvelteKit
      // https://github.com/sveltejs/kit/blob/master/packages/kit/src/exports/vite/index.js#L471
      if (config.build.ssr || config.mode !== 'production') {
        // checking `config.mode` is production may not be the best approach, but we do not want to execute this build in `test` mode (from Vitest)
        return
      }

      // TODO: dynamic outdir based on user config because SvelteKit is hiding this behind .svelte-kit/output
      const outDir = path.join(config.root, 'build')

      const server: UserConfig = {
        root: config.root,
        define: {
          ...(config.define || {}),
          $sveltekit_handler: './handler.js',
        },
        resolve: {
          alias: [...config.resolve.alias],
        },
        build: {
          outDir,
          emptyOutDir: false, // we don't want to overwrite SvelteKit's output
          ssr: true,
          rollupOptions: {
            input: {
              server: userServerFile,
            },
            external: ['./handler.js'],
          },
        },
      }

      try {
        const TIMER_MESSAGE = colors.green('  ✔ done')
        console.time(TIMER_MESSAGE)
        // build the server file
        await build(server)
        console.timeEnd(TIMER_MESSAGE)
      } catch (error) {
        throw new Error(
          `There was an error building the custom server: ${error.message}`
        )
      }
    },
  }
}

export const server = VitePluginServer
export default server
