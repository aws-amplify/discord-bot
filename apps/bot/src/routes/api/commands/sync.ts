import { commands } from './../../../discord/client'

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
