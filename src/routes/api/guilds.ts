import { get as read } from 'svelte/store'
import { guild as store } from '$lib/store'
import { api } from './_discord'
import { Routes } from 'discord-api-types/v10'
import type { APIGuild } from 'discord-api-types/v10'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ locals }) {
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

  // const defaultGuildId = read(store)
  const defaultGuildId = import.meta.env.VITE_DISCORD_GUILD_ID
  if (guilds.length && defaultGuildId) {
    store.set(guilds.find(({ id }) => id === defaultGuildId))
  }

  return {
    status: 200,
    body: guilds.map((guild) => ({ id: guild.id, text: guild.name })),
  }
}
