import { Routes } from 'discord-api-types/v10'
import type { APIGuildMember } from 'discord-api-types/v10'
import { api } from '$lib/discord'
import type { RequestHandler } from '@sveltejs/kit'

const guildId = import.meta.env.VITE_DISCORD_GUILD_ID

async function getDiscordUsername(userId: string) {
  try {
    const guildMember = (await api.get(Routes.guildMember(guildId, userId))) as
      | APIGuildMember
      | undefined
    if (guildMember?.nick) return guildMember.nick
    if (guildMember?.user?.username) return guildMember.user.username
  } catch (error) {
    console.error(`Failed to fetch discord username: ${error.message}`)
  }
  return 'unknown'
}

export const GET: RequestHandler = async ({ params }) => {
  const { userId } = params
  const result = await getDiscordUsername(userId)
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200, 
    body: result,
  }
}
