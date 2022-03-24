import express from 'express'
import bodyParser from 'body-parser'
import { discord } from '@hey-amplify/discord'

/**
 * Express.js app
 * @param {import('express').RequestHandler[]} middlewares - middleware to add on init
 * @returns {import('express').Application}
 */
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

  server.get('/commands/list', async function (req, res) {
    try {
      res.end(JSON.stringify(await discord.listCommands()))
      return
    } catch (error) {
      console.error('Error listing commands', error)
      res.status(500)
      res.end(JSON.stringify({ error, message: 'Unable to list commands' }))
    }
  })

  server.post('/commands/sync', async function (req, res) {
    try {
      res.end(JSON.stringify(await discord.syncCommands()))
      return
    } catch (error) {
      console.error('Error syncing commands', error)
      res.status(500)
      res.end(JSON.stringify({ error, message: 'Unable to sync commands' }))
    }
  })

  return server
}
