import { commands } from './../../lib/discord/client'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get() {
  const list = await commands.list()

  if (!list) {
    return {
      status: 500,
    }
  }

  return {
    body: { list },
  }
}
