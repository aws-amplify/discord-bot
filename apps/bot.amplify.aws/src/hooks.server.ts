import { GUILD_COOKIE } from '$lib/constants'
import { getUserAccess } from '@hey-amplify/discord'
import { sequence } from '@sveltejs/kit/hooks'
import cookie from 'cookie'
import { prisma, init } from '$lib/db'
import type { Handle } from '@sveltejs/kit'
import { handleAuth } from '$lib/server/hooks/handle-auth'
import { handleApiAuth } from '$lib/server/hooks/handle-api-auth'
import { handleSavedGuild } from '$lib/server/hooks/handle-saved-guild'
import { handleSetSessionLocals } from '$lib/server/hooks/handle-set-session-locals'

/**
 * Add additional user data to the session
 * @deprecated
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
    if (!guild) guild = activeGuild
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
      access = await getUserAccess(discordUserId, guild)
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

export const handle = sequence(
  handleSavedGuild,
  handleAuth,
  handleSetSessionLocals,
  // handleSession, // get session from NextAuth.js
  // handleSessionUser, // add user details to session locals
  handleApiAuth // protect API routes
)
