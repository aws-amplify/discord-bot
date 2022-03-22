import { getServerSession } from '$lib/next-auth'
import DiscordProvider from 'next-auth/providers/discord'

const nextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: import.meta.env.VITE_DISCORD_CLIENT_ID,
      clientSecret: import.meta.env.VITE_DISCORD_CLIENT_SECRET,
    }),
  ],
}

export async function handle({ event, resolve }) {
  const session = await getServerSession(event.request, nextAuthOptions)
  event.locals.session = session

  return resolve(event)
}

export function getSession(event) {
  return event.locals.session || {}
}
