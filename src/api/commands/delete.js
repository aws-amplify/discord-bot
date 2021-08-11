import { deleteCommand } from '../../discord.js'

export async function handler(request, response) {
  let data
  try {
    data = await deleteCommand(request.params.id)
  } catch (error) {
    response.status(500)
    response.json({ error })
    return
  }
  response.status(200)
  response.json({ data })
}
