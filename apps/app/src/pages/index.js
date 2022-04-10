import { commands } from '@hey-amplify/bot'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get() {
  const list = await commands.list()

  return {
    body: { list },
  }
}
