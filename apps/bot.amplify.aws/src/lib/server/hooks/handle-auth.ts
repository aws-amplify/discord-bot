import { SvelteKitAuth } from '@auth/sveltekit'
import GitHub from '@auth/core/providers/github'
import Discord from '@auth/core/providers/discord'
import { getUserAccess } from '@hey-amplify/discord'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import {
  DISCORD_AUTH_CLIENT_ID,
  DISCORD_AUTH_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from '$env/static/private'
import { get } from 'svelte/store'
import { prisma } from '$lib/db'
import { guild } from '$lib/store'
import type { AppSession } from '../../../app'

/**
 * @todo use session callback to extend session?
 * @todo port in changes to apply roles in discord based on GitHub org membership (if integration is enabled)
 */
export const handleAuth = SvelteKitAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({ clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET }),
    Discord({
      clientId: DISCORD_AUTH_CLIENT_ID,
      clientSecret: DISCORD_AUTH_CLIENT_SECRET,
    }),
  ],
  pages: {
    error: '/error',
  },
  callbacks: {
    async session({ session, token, user }): Promise<AppSession> {
      if (!session.user) {
        // cast AppSession type (all of the missing properties are booleans)
        return session as AppSession
      }
      // read guild from store, set initially by handleSavedGuild hook
      const guildId = get(guild)
      // get GitHub user data from database and set on session (if exists)
      const storedUser = await prisma.user.findUnique({
        where: {
          id: user.id,
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

      const appSession = session as AppSession

      // set GitHub linked flag on session
      appSession.isGithubLinked = storedUser!.accounts.some(
        (account) => account.provider === 'github'
      )

      // set Discord user access on session
      let access = {
        isGuildOwner: false,
        isAdmin: false,
        isStaff: false,
      }
      try {
        const storedUserDiscordId = storedUser?.accounts.find(
          (account) => account.provider === 'discord'
        )?.providerAccountId
        if (!storedUserDiscordId) {
          throw new Error('User does not have a Discord account linked')
        }
        access = await getUserAccess(storedUserDiscordId, guildId)
      } catch (cause) {
        console.error('Error getting user access', cause)
      }
      appSession.user = {
        ...session.user,
        ...access,
        id: user.id,
      }
      return appSession
    },
  },
})
