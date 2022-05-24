import cookie from 'cookie'
import { RouteBases, Routes } from 'discord-api-types/v10'
import { createDiscordApi } from '@hey-amplify/discord'
import { createBot } from '$discord/client'
import type { GetSession } from '@sveltejs/kit'

const client = await createBot()

const api = createDiscordApi()
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

  /** @description Discord Access Token */
  let token: string

  // if only refresh token is found, then access token has expired. perform a refresh on it.
  if (cookies.discord_refresh_token && !cookies.discord_access_token) {
    const discordRequest = await fetch(
      `${HOST}/api/auth/refresh?code=${cookies.discord_refresh_token}`
    )
    const discordResponse = await discordRequest.json()

    if (discordResponse.discord_access_token) {
      token = discordResponse.discord_access_token
    }
  }

  if (cookies.discord_access_token) {
    token = cookies.discord_access_token
  }

  if (token) {
    const user = await fetchUserData(token)

    const botGuilds = await api.get(Routes.userGuilds())
    const memberships = []
    for (const guild of botGuilds as [{ id }]) {
      const member = await api.get(Routes.guildMember(guild.id, user.id))
      if (member) {
        memberships.push(member)
      }
    }

    user.memberships = memberships

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
