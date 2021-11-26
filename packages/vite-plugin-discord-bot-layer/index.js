import { resolve } from 'node:path'
import { interact } from '@amplify-discord-bots/handler-interact'

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
    req.body = JSON.parse(data)
    res.setHeader('Content-Type', 'application/json')

    let result

    if (req.url === '/api/interact') {
      result = await interact(req)
    }

    if (req.url === '/api/hello') {
      result = req.body
    }

    res.end(JSON.stringify(result))
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
      server.middlewares.use(DiscordBotLayerPluginHandler)
    },
  }
}
