import { createBot } from '$discord/client'
import { getServerSession, options } from '$lib/next-auth'
import type { RequestHandler } from '@sveltejs/kit'
import type { Session } from 'next-auth'

const client = await createBot()

function isApiRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api')
}

function isApiAuthRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api/auth')
}

function isApiAdminRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api/admin')
}

/** @type {RequestHandler} */
export async function handle({ event, resolve }): Promise<Response> {
  const session = await getServerSession(event.request, options)
  event.locals.session = session

  console.log(event.url.pathname)
  // protect API routes
  if (isApiRoute(event.url.pathname)) {
    if (!isApiAuthRoute(event.url.pathname)) {
      if (!session.user) {
        return new Response('Unauthorized', { status: 401 })
      }
      if (isApiAdminRoute(event.url.pathname) && !session.user.isAdmin) {
        return new Response('Forbidden', { status: 403 })
      }
    }
  }

  const response = resolve(event)
  return response
}

export function getSession(event): Session {
  return event.locals.session || {}
}
