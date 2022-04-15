import express from 'express'
import { createBot, client } from './client'

createBot()

const app = express()
const api = express.Router()
const PORT = process.env.BOT_PORT || 3000

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

app.listen(PORT, () => {
  console.log(`Discord Bot API listening on port ${PORT}!`)
})
