import { commands } from '@hey-amplify/bot'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post() {
  const list = await commands.sync()

  if (!list) {
    return {
      status: 500,
    }
  }

  return {
    body: { list },
  }
}
