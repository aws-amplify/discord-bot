import { resolve } from 'node:path'
import { handler as interact } from '@hey-amplify/handler-interact'
import { app } from '@hey-amplify/handler-commands'
import { app as webhookApp } from '@hey-amplify/handler-webhook'

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
      const commands = app()
      req.url = req.url.slice(4)
      commands.handle(req, res, next)
      return
    }

    if (req.url.startsWith('/api/webhook')) {
      const webhook = webhookApp()
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
 * Loads secrets from .env file in project root
 * @returns {void} loads secrets to `process.env`
 */
async function loadSecrets() {
  const path = resolve('../../', '.env')
  ;(await import('dotenv')).config({
    path,
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
      try {
        await loadSecrets()
      } catch (error) {
        console.warn(
          'Error loading secrets, Discord bot layer unstable...',
          error
        )
      }
      console.log(
        `Started Discord Bot Layer for env: ${process.env.DISCORD_ENV}`
      )
      server.middlewares.use(DiscordBotLayerPluginHandler)
    },
  }
}
