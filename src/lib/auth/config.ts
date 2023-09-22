import GitHub from '@auth/core/providers/github'
import Discord from '@auth/core/providers/discord'
import { get } from 'svelte/store'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getUserAccess } from '$lib/discord/get-user-access'
import { prisma } from '$lib/db'
import { guild } from '$lib/store'
import type { AppSession } from '../../app'
import type { SvelteKitAuthConfig } from '@auth/sveltekit'

export const config: SvelteKitAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: process.env.IS_TEST === 'true' ? true : undefined,
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
    async session({ session, user }): Promise<AppSession> {
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

      if (!storedUser) {
        // this should never happen
        throw new Error(`User not found in database: ${user.id}`)
      }

      // set Discord user access on session
      let access = {
        isGuildOwner: false,
        isAdmin: false,
        isStaff: false,
      }
      const discordUserId = storedUser.accounts.find(
        (account) => account.provider === 'discord'
      )?.providerAccountId

      if (!discordUserId) {
        // this should also never happen since the user is authenticated with Discord
        throw new Error('User does not have a Discord account linked')
      }

      try {
        access = await getUserAccess(discordUserId, guildId)
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
}
