import { SvelteKitAuth } from '@auth/sveltekit'
import GitHub from '@auth/core/providers/github'
import Discord from '@auth/core/providers/discord'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import {
  DISCORD_AUTH_CLIENT_ID,
  DISCORD_AUTH_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from '$env/static/private'
import { prisma } from '$lib/db'

/**
 * @todo use session callback to extend session?
 * @todo port in changes to apply roles in discord based on GitHub org membership (if integration is enabled)
 */
export const handle = SvelteKitAuth({
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
})
