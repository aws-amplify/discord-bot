import { syncCommands } from '../discord.js'

export async function handler(request, response) {
  let data
  try {
    data = await syncCommands()
  } catch (error) {
    response.status(500)
    response.json({ error })
    return
  }
  response.status(200)
  response.json({ data })
}
