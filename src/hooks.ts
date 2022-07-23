import { createBot } from '$discord/client'
import { prisma } from '$lib/db'
import { getUserAccess } from '$discord/guild'
import { getServerSession, options } from '$lib/next-auth'
import type { Session as NextAuthSession } from 'next-auth'

// only load the bot if we're in development (on first request to the server), otherwise the bot will be loaded onto the Node/Express server
if (import.meta.env.DEV) {
  await createBot()
}

function isApiRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api')
}

function isApiWebhookRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api/webhooks')
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

  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        accounts: {
          where: {
            provider: 'discord',
          },
          select: {
            providerAccountId: true,
          },
        },
      },
    })

    const discordUserId = user.accounts[0].providerAccountId
    event.locals.session.user = {
      ...event.locals.session.user,
      ...(await getUserAccess(discordUserId)),
      id: discordUserId,
    }
  }

  // protect API routes
  if (isApiRoute(event.url.pathname)) {
    if (
      !isApiAuthRoute(event.url.pathname) &&
      !isApiWebhookRoute(event.url.pathname)
    ) {
      if (!session?.user) {
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

export type Session = NextAuthSession & {}

export async function getSession(event): Promise<Session> {
  return event.locals.session
}
