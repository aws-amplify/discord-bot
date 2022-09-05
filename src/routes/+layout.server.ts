import { api } from '$discord/api'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { type LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
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

  return {
    session: locals.session,
    guilds: guilds.map((guild) => ({
      id: guild.id,
      text: guild.name,
      icon: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : null,
    })),
    selectedGuild:
      guilds.find((g) => g.id === locals?.session?.guild)?.id || defaultGuildId,
  }
}
