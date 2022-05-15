import express from 'express'
import { createBot, client } from './client'
import { prisma } from './db'

createBot()

const app = express()
const api = express.Router()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('*', (req, res, next) => {
  // TODO: auth
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// API
// List all questions (threads)
api.get('/questions', async (req, res) => {
  res.json(await prisma.question.findMany())
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
