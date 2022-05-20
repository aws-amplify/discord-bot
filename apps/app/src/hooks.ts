import cookie from 'cookie'
import { RouteBases, Routes } from 'discord-api-types/v10'
import type { GetSession } from '@sveltejs/kit'

const USER_URL = RouteBases.api + Routes.user()
const HOST = import.meta.env.VITE_HOST

async function fetchUserData(token) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
  const res = await fetch(USER_URL, { headers })
  const result = await res.json()
  return result
}

/** @type {import('@sveltejs/kit').GetSession} */
export async function getSession(event) {
  const cookies = cookie.parse(event.request.headers.get('cookie') || '')

  // if only refresh token is found, then access token has expired. perform a refresh on it.
  if (cookies.discord_refresh_token && !cookies.discord_access_token) {
    console.log('calling refresh')
    const discordRequest = await fetch(
      `${HOST}/api/auth/refresh?code=${cookies.discord_refresh_token}`
    )
    const discordResponse = await discordRequest.json()

    if (discordResponse.discord_access_token) {
      const user = await fetchUserData(discordResponse.discord_access_token)

      if (user.id) {
        return {
          user,
        }
      }
    }
  }

  if (cookies.discord_access_token) {
    const user = await fetchUserData(cookies.discord_access_token)

    if (user.id) {
      return {
        user,
      }
    }
  }

  // not authenticated, return empty user object
  return {
    user: false,
  }
}
