import express from 'express'
import bodyParser from 'body-parser'

export const AMPLIFY_RELEASES_CHANNEL =
  process.env.AMPLIFY_DISCORD_RELEASES_CHANNEL_ID

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

  server.get('/webhook', async function (req, res) {
    try {
      res.end(JSON.stringify('hello discord webhook'))
      return
    } catch (error) {
      console.error('Error logging', error)
      res.status(500)
      res.end(JSON.stringify({ error, message: 'Unable to say hello' }))
    }
  })

  server.post('/webhook/github', async function (req, res) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET
    try {
      res.end(JSON.stringify('hello github webhook'))
      return
    } catch (error) {
      console.error('Error logging', error)
      res.status(500)
      res.end(JSON.stringify({ error, message: 'Unable to say hello' }))
    }
  })

  return server
}
