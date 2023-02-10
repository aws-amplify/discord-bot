import { Routes } from 'discord-api-types/v10'
import { api } from '@hey-amplify/discord'
import type { RequestHandler } from '@sveltejs/kit'
import type { APIGuildMember } from 'discord-api-types/v10'

const guildId = import.meta.env.VITE_DISCORD_GUILD_ID

async function getDiscordUsername(userId: string) {
  try {
    const guildMember = (await api.get(Routes.guildMember(guildId, userId))) as
      | APIGuildMember
      | undefined
    if (guildMember?.nick) return guildMember.nick
    if (guildMember?.user?.username) return guildMember.user.username
  } catch (error) {
    // swallow unknown user errors (only comes up in testing)
    if (error.message !== 'Unknown User') {
      console.error(`Failed to fetch discord username: ${error.message}`)
    }
  }
  return 'unknown'
}

export const GET: RequestHandler = async ({ params }) => {
  const { userId } = params
  if (!userId) {
    return new Response(
      // JSON.stringify({ errors: [{ message: 'Invalid User ID' }] }),
      'Invalid User ID',
      {
        status: 400,
      }
    )
  }
  const result = await getDiscordUsername(userId)
  return new Response(result)
}
