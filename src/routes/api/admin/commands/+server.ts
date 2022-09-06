import { json, type RequestHandler } from '@sveltejs/kit'
import { Routes } from 'discord-api-types/v10'
import { env } from '$env/dynamic/private'
import { api } from '$discord/api'
import { registerCommands } from '$discord/commands'

export const POST: RequestHandler = async () => {
  /**
   * @TODO register single command
   */
  const list = await registerCommands()

  if (!list) {
    return new Response(undefined, { status: 500 })
  }

  return json({ list })
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  let id: string
  try {
    const data = await request.formData()
    id = data.get('id')
  } catch (error) {
    return new Response('Invalid body', { status: 400 })
  }

  // error out if no id is provided
  if (!id) {
    return new Response('Invalid body', { status: 400 })
  }

  const result = await api.delete(
    Routes.applicationGuildCommand(env.DISCORD_APP_ID, locals.session.guild, id)
  )

  console.log('got result', result)
  return new Response(JSON.stringify(result), { status: 200 })

  // return new Response(undefined, { status: 500 })
}
