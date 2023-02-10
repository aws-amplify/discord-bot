import { json, type RequestHandler } from '@sveltejs/kit'
import {
  registerCommand,
  registerCommands,
  unregisterCommand,
  commands,
} from '@hey-amplify/discord'

export const POST: RequestHandler = async ({ locals }) => {
  const list = await registerCommands(undefined, locals.session.guild)

  if (!list) {
    return new Response(undefined, { status: 500 })
  }

  return json({ list })
}

export const PUT: RequestHandler = async ({ request, locals }) => {
  let command: string
  try {
    const data = await request.formData()
    command = data.get('command')
  } catch (error) {
    return new Response('Invalid body', { status: 400 })
  }

  const stored = commands.get(command)
  if (!stored) return new Response('Invalid command', { status: 400 })

  const registered = await registerCommand(stored, locals.session.guild)

  if (!registered) {
    return new Response('Unable to register command', { status: 500 })
  }

  return json(registered)
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

  try {
    await unregisterCommand(id, locals.session.guild)
    return new Response('success', { status: 200 })
  } catch (error) {
    console.error(
      `Something went wrong unregistering command ${id} for guild ${locals.session.guild}`,
      error
    )
    return new Response('Something went wrong unregistering the command', {
      status: 500,
    })
  }
}
