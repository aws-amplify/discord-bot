import { registerCommands } from '$discord/commands'
import type { RequestHandler } from '@sveltejs/kit'

export const post: RequestHandler = async () => {
  const list = await registerCommands()

  if (!list) {
    return {
      status: 500,
    }
  }

  return {
    body: { list },
  }
}

// export const del = async ({ request }) => {
//   const body = await request.json()
//   const unregistered = await commands.unregister(body.id)

//   if (!unregistered) {
//     return {
//       status: 500,
//     }
//   }

//   return {
//     body: { unregistered },
//   }
// }
