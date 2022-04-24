import express from 'express'
import { createBot, client } from './client.js'

createBot()

if (import.meta.env.DEV) {
  const app = express()
  const api = express.Router()
  const PORT = process.env.PORT || 3000

  app.use('*', (req, res, next) => {
    // TODO: auth
    next()
  })

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  api.get('/guilds', (req, res) => {
    res.json(client.guilds.cache.map((guild) => guild.name))
  })

  app.use('/api', api)

  client.on('ready', () => {
    app.listen(PORT, () => {
      console.log(`Discord Bot API listening on port ${PORT}!`)
    })
  })
}
