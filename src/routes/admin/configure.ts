import { Routes } from 'discord-api-types/v10'
import { api } from '../api/_discord'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get(event) {
  const id = event.url.searchParams.get('id')
  const guilds = await api.get(Routes.userGuilds())

  const guildId = id || guilds[0].id

  const guild = await api.get(Routes.guild(guildId))
  const roles = await api.get(Routes.guildRoles(guildId))

  const configResponse = await fetch(
    `${import.meta.env.VITE_HOST}/api/admin/configure?guildId=${guildId}`
  )
  const config = await configResponse.json()

  return {
    body: {
      configure: {
        guilds,
        guild,
        roles,
        config,
      },
    },
  }
}
