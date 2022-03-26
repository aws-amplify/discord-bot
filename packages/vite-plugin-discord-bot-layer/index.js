import { resolve } from 'node:path'

const loadInteractionHandler = () => import('@hey-amplify/handler-interact')
const loadCommandsApp = () => import('@hey-amplify/handler-commands')
const loadWebhookApp = () => import('@hey-amplify/handler-webhook')

/**
 * Connect-style middleware handler for Discord bot API layer
 * @param {import('vite').Connect.IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {import('vite').Connect.NextHandleFunction} next
 */
async function DiscordBotLayerPluginHandler(req, res, next) {
  if (!req.url?.startsWith('/api')) {
    next()
    return
  }

  let data = ''
  req.on('data', (chunk) => {
    data += chunk
  })
  req.on('end', async () => {
    if (data) req.body = JSON.parse(data)
    res.setHeader('Content-Type', 'application/json')

    let result

    if (req.url === '/api/interact') {
      const { handler: interact } = await loadInteractionHandler()
      try {
        result = await interact(req)
      } catch (error) {
        console.error('Failed to interact:', error)
        if (res.statusCode === 200) res.statusCode = 401
        result = {
          error: {
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
        }
      }
    }

    if (req.url === '/api/hello') {
      result = { hello: 'world' }
      if (req.body) result = req.body
    }

    if (req.url.startsWith('/api/commands')) {
      const { app } = await loadCommandsApp()
      const commands = app()
      req.url = req.url.slice(4)
      commands.handle(req, res, next)
      return
    }

    if (req.url.startsWith('/api/webhook')) {
      const { app } = await loadWebhookApp()
      const webhook = app()
      req.url = req.url.slice(4)
      webhook.handle(req, res, next)
      return
    }

    if (result) {
      if (result.error) {
        if (res?.statusCode === 200) res.statusCode = 500
        res.end(JSON.stringify(result))
        return
      }
      res.end(JSON.stringify(result))
    } else res.end()
  })
}

/**
 * Adds the Discord bot routes to Vite dev server, mimicking API Gateway setup
 * @returns {import('vite').Plugin}
 */
export function DiscordBotLayerPlugin() {
  return {
    name: 'discord-bot-layer-plugin',
    configureServer: async (server) => {
      console.log(
        `Started Discord Bot Layer for env: ${process.env.DISCORD_ENV}`
      )
      server.middlewares.use(DiscordBotLayerPluginHandler)
    },
  }
}
