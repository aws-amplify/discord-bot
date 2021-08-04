import { Router } from 'express'
import * as interact from './interact.js'
import * as list from './commands/list.js'
import * as sync from './commands/sync.js'
import * as deleteCommand from './commands/delete.js'

async function interactionHandler(request, response) {
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

async function notImplemented(request, response) {
  response.status(501)
  response.end()
}

export const api = new Router()

api.all('/interact', interactionHandler)
// TODO: move `sync` to command handler only executable by mods/frontend
// TODO: authorize `/api/commands` calls for use in prod
if (process.env.NODE_ENV !== 'production') {
  api.get('/commands/list', list.handler)
  api.post('/commands/sync', sync.handler)
  api.delete('/commands/delete/:id', deleteCommand.handler)
}
