import express from 'express'
import bodyParser from 'body-parser'
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware'
import { bank } from '@amplify-discord-bots/bank'
import { registerCommand } from '@amplify-discord-bots/discord'

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

app.post('/commands/sync', async function (req, res) {
  async function syncCommands() {
    const commands = Array.from(bank.values()).map(registerCommand)
    return await Promise.allSettled(commands)
  }
  try {
    return res.json(JSON.stringify(await syncCommands()))
  } catch (error) {
    res.status(500)
    res.json(JSON.stringify({ error, message: 'Unable to sync commands' }))
  }
})

app.listen(3000, function () {
  console.log('App started')
})

export { app }
