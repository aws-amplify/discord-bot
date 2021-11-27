import { resolve } from 'node:path'
import { handler as interact } from '@amplify-discord-bots/handler-interact'
import { app } from '@amplify-discord-bots/handler-commands'

/**
 *
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
      result = await interact(req)
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

    if (result) res.end(JSON.stringify(result))
    else res.end()
  })
}

async function loadSecrets() {
  ;(await import('dotenv')).config({
    path: resolve('../../', '.env'),
  })
}

export function DiscordBotLayerPlugin(pluginOptions = {}) {
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
