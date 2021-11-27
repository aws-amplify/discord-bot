import express from 'express'
import bodyParser from 'body-parser'
import { syncCommands } from '@amplify-discord-bots/discord'

export function app(middlewares = []) {
  const server = express()
  server.use(bodyParser.json())

  if (middlewares.length) {
    for (let middleware of middlewares) {
      server.use(middleware)
    }
  }

  // Enable CORS for all methods
  server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    next()
  })

  server.post('/commands/sync', async function (req, res) {
    try {
      res.end(JSON.stringify(await syncCommands()))
      return
    } catch (error) {
      console.error('Error syncing commands', error)
      res.status(500)
      res.end(JSON.stringify({ error, message: 'Unable to sync commands' }))
    }
  })

  return server
}
