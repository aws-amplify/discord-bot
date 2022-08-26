import { json, type RequestHandler } from '@sveltejs/kit'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { guild as store } from '$lib/store'
import { api } from '../_discord'

export const GET: RequestHandler = async ({ locals }) => {
  const botGuilds = (await api.get(Routes.userGuilds())) as APIGuild[]

  const guilds = []
  for (const guild of botGuilds) {
    try {
      await api.get(Routes.guildMember(guild.id, locals.session.user.id))
      guilds.push(guild)
    } catch (error) {
      // user is not a member of this guild
    }
  }

  const defaultGuildId = import.meta.env.VITE_DISCORD_GUILD_ID
  if (guilds.length && defaultGuildId) {
    store.set(guilds.find(({ id }) => id === defaultGuildId))
  }

  return json(guilds.map((guild) => ({ id: guild.id, text: guild.name })))
}
