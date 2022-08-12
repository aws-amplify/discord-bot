import { createBot } from '$discord/client'
import { prisma, init } from '$lib/db'
import { getUserAccess } from '$discord/get-user-access'
import { getServerSession, options } from '$lib/next-auth'
import type { Handle, GetSession } from '@sveltejs/kit'

// only load the bot if we're in development (on first request to the server), otherwise the bot will be loaded onto the Node/Express server
if (import.meta.env.MODE === 'development') {
  await init()
  await createBot()
}

function isApiRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api')
}

function isApiAdminRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api/admin')
}

function isPublicApiRoute(pathname: URL['pathname']) {
  const publicRoutes = ['/api/auth', '/api/p', '/api/webhooks']
  return publicRoutes.some((route) => pathname.startsWith(route))
}

export const handle: Handle = async function handle({
  event,
  resolve,
}): Promise<Response> {
  const session = await getServerSession(event.request, options)

  if (session?.user) {
    event.locals.session = session
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    })

    const storedUserGitHub = user!.accounts.some(
      (account) => account.provider === 'github'
    )
    if (storedUserGitHub) session.user.github = true

    const discordUserId = user!.accounts.filter(
      (account) => account.provider === 'discord'
    )[0].providerAccountId
    let access
    try {
      access = await getUserAccess(discordUserId)
    } catch (error) {
      console.error('Error getting access', error)
    }
    session.user = {
      ...session.user,
      ...(access || {}),
      id: discordUserId,
    }
  }

  // protect API routes
  if (isApiRoute(event.url.pathname)) {
    if (!isPublicApiRoute(event.url.pathname)) {
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

export const getSession: GetSession = async function getSession(
  event
): Promise<App.Session> {
  return event.locals.session
}
