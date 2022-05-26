import { createBot } from '$discord/client'
import { getServerSession, options } from '$lib/next-auth'
import type { RequestHandler } from '@sveltejs/kit'
import type { Session } from 'next-auth'

// const client = await createBot()

export async function handle({ event, resolve }): Promise<Response> {
  const session = await getServerSession(event.request, options)
  event.locals.session = session

  return resolve(event)
}

export function getSession(event): Session {
  return event.locals.session || {}
}
