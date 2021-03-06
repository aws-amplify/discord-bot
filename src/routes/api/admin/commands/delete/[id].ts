import { commands } from '$discord/client'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function del({ request }) {
  const body = await request.json()
  const unregistered = await commands.unregister(body.id)

  if (!unregistered) {
    return {
      status: 500,
    }
  }

  return {
    body: { unregistered },
  }
}
