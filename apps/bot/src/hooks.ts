import type { Session } from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import GithubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { createBot } from '$discord/client'
import { getServerSession } from '$lib/next-auth'
import { prisma } from '$lib/db'

const client = await createBot()

const nextAuthOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_AUTH_CLIENT_ID,
      clientSecret: process.env.DISCORD_AUTH_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
}

export async function handle({ event, resolve }): Promise<Response> {
  const session = await getServerSession(event.request, nextAuthOptions)
  event.locals.session = session

  return resolve(event)
}

export function getSession(event): Session {
  return event.locals.session || {}
}
