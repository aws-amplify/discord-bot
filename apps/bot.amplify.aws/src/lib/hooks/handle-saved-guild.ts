import cookie from 'cookie'
import { GUILD_COOKIE } from '$lib/constants'
import { guild as store } from '$lib/store'
import type { Handle } from '@sveltejs/kit'

export const handleSavedGuild: Handle = async ({ event, resolve }) => {
  let savedGuild = null
  const cookies = event.request.headers.get('cookie')
  if (cookies) {
    const parsed = cookie.parse(cookies)
    savedGuild = parsed['hey-amplify.guild']
  }

  let activeGuild = import.meta.env.VITE_DISCORD_GUILD_ID
  if (savedGuild) activeGuild = savedGuild

  // set guild on locals
  event.locals.guild = activeGuild
  // set guild store
  store.set(activeGuild)

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
