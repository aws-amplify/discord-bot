import { api } from '@hey-amplify/discord'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const defaultGuildId = locals.session?.guild
  const botGuilds = (await api.get(Routes.userGuilds())) as APIGuild[]

  const guilds = []
  // only attempt to fetch guild memberships if the user is logged in
  if (locals.session?.user) {
    for (const guild of botGuilds) {
      try {
        await api.get(Routes.guildMember(guild.id, locals.session.user.id))
        guilds.push(guild)
      } catch (error) {
        // user is not a member of this guild, this messaging can be safely ignored but is available for debugging
        console.warn(
          `[ignore] Error fetching guild member for ${guild.id}: ${error}`
        )
      }
    }
  }

  return {
    session: locals.session,
    guilds: guilds.map((guild) => ({
      id: guild.id,
      text: guild.name,
      icon: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : null,
    })),
    // falling back to `defaultGuildId` assumes the bot is at least a member of the default guild
    selectedGuild:
      guilds.find((g) => g.id === locals?.session?.guild)?.id || defaultGuildId,
  }
}
