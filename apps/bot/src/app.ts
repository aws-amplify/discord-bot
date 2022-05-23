import express from 'express'
import { createBot, client } from './client'
import { api } from './api'

createBot()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('*', (req, res, next) => {
  // TODO: auth
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api', api)

client.on('ready', () => {
  console.log('Discord Bot Ready!')
})

if (import.meta.env.DEV) {
  app.listen(PORT, () => {
    console.log(`Discord Bot API listening on port ${PORT}!`)
  })
}
