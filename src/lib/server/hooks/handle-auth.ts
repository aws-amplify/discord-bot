import { SvelteKitAuth } from '@auth/sveltekit'
import GitHub from '@auth/core/providers/github'
import Discord from '@auth/core/providers/discord'
import { get } from 'svelte/store'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getUserAccess } from '$lib/discord/get-user-access'
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
  // cookies: {
  //   pkceCodeVerifier: {
  //     name: 'next-auth.pkce.code_verifier',
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'none',
  //       path: '/',
  //       secure: true,
  //     },
  //   },
  // },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Discord({
      clientId: process.env.DISCORD_AUTH_CLIENT_ID,
      clientSecret: process.env.DISCORD_AUTH_CLIENT_SECRET,
    }),
  ],
  pages: {
    // disable signin page
    signIn: '/',
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

      // set Discord user access on session
      let access = {
        isGuildOwner: false,
        isAdmin: false,
        isStaff: false,
      }
      let discordUserId: string

      try {
        const storedUserDiscordId = storedUser?.accounts.find(
          (account) => account.provider === 'discord'
        )?.providerAccountId
        if (!storedUserDiscordId) {
          throw new Error('User does not have a Discord account linked')
        }
        access = await getUserAccess(storedUserDiscordId, guildId)
        // set discord user ID and assert that we've extended the session and already checked if user
        discordUserId = storedUserDiscordId
      } catch (cause) {
        console.error('Error getting user access', cause)
      }

      return {
        ...session,
        user: {
          ...session.user,
          ...access,
          id: user.id,
          // set GitHub linked flag on session
          isGithubLinked: storedUser!.accounts.some(
            (account) => account.provider === 'github'
          ),
          discordUserId: discordUserId!,
        },
      }
    },
  },
})
