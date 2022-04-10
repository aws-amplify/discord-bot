import NextAuth from '$lib/next-auth'
import DiscordProvider from 'next-auth/providers/discord'

const nextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: import.meta.env.VITE_DISCORD_OAUTH_CLIENT_ID as string,
      clientSecret: import.meta.env.VITE_DISCORD_OAUTH_CLIENT_SECRET as string,
    }),
  ],
}

export const { get, post } = NextAuth(nextAuthOptions)
