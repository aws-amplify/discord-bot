import { json } from '@sveltejs/kit'
import { registerCommands } from '$discord/commands'
import type { RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async () => {
  const list = await registerCommands()

  if (!list) {
    return new Response(undefined, { status: 500 })
  }

  return json({ list })
}
