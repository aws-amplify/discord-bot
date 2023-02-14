import { GUILD_COOKIE } from '$lib/constants'
import { getUserAccess } from '@hey-amplify/discord'
import { sequence } from '@sveltejs/kit/hooks'
import cookie from 'cookie'
import { prisma, init } from '$lib/db'
import { getServerSession, options } from '$lib/next-auth'
import type { Handle } from '@sveltejs/kit'

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

/**
 * Get session from NextAuth.js
 */
const handleSession: Handle = async ({ event, resolve }) => {
  const session = await getServerSession(event.request, options)
  // @ts-expect-error - apply NextAuth.js session directly to session locals
  event.locals.session = session
  return resolve(event)
}

/**
 * Add additional user data to the session
 */
const handleSessionUser: Handle = async ({ event, resolve }) => {
  const { session } = event.locals

  let savedGuild = null
  const cookies = event.request.headers.get('cookie')
  if (cookies) {
    const parsed = cookie.parse(cookies)
    savedGuild = parsed['hey-amplify.guild']
  }

  let activeGuild = import.meta.env.VITE_DISCORD_GUILD_ID
  if (savedGuild) activeGuild = savedGuild

  if (session?.user) {
    if (!session.guild) session.guild = activeGuild
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
      access = await getUserAccess(discordUserId, session.guild)
    } catch (error) {
      console.error('Error getting access', error)
    }
    session.user = {
      ...session.user,
      ...(access || {}),
      id: discordUserId,
    }
  }

  const response = await resolve(event)

  // set initial guild cookie
  if (!savedGuild) {
    response.headers.append(
      'Set-Cookie',
      cookie.serialize(GUILD_COOKIE, activeGuild, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
      })
    )
  }

  return response
}

/**
 * Handle and protect API routes
 */
const handleApiAuth: Handle = async ({ event, resolve }) => {
  // protect API routes
  if (isApiRoute(event.url.pathname)) {
    if (!isPublicApiRoute(event.url.pathname)) {
      if (!event.locals.session?.user) {
        return new Response('Unauthorized', { status: 401 })
      }
      if (
        isApiAdminRoute(event.url.pathname) &&
        !event.locals.session.user.isAdmin
      ) {
        return new Response('Forbidden', { status: 403 })
      }
    }
  }

  return resolve(event)
}

export const handle = sequence(
  handleSession, // get session from NextAuth.js
  handleSessionUser, // add user details to session locals
  handleApiAuth // protect API routes
)
