import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    session: locals.session,
    guilds: locals.guilds.map((guild) => ({
      id: guild.id,
      text: guild.name,
      icon: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : null,
    })),
    // falling back to `defaultGuildId` assumes the bot is at least a member of the default guild
    guildId: locals.guildId,
  }
}
