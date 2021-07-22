import express from 'express'
import morgan from 'morgan'
import * as interact from './api/interact.js'
import * as sync from './api/sync.js'

async function handler(request, response) {
  try {
    const interactionResponse = await interact.handler(request)
    if (interactionResponse) {
      return response.json(interactionResponse)
    }
  } catch (error) {
    response.status(500)
    response.json({ error })
  }
}

function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error)
  }
  response.status(500)
  response.json({ error })
}

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(morgan('tiny'))
app.use(express.json())
// TODO: remove this and just use middleware for single endpoint handling
app.all('/', handler)
app.get('/_health', (req, res) => {
  res.send('ok')
})
// TODO: move `sync` to command handler only executable by mods/frontend
if (process.env.NODE_ENV !== 'production') {
  app.post('/sync', sync.handler)
}
app.use(errorHandler)
app.listen(PORT, () => console.log('Listening...'))
