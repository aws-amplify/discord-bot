import { Routes } from 'discord-api-types/v10'
import { api } from '$lib/discord/api'
import { isHelpChannel } from '$lib/discord/support'
import type { APIPartialChannel } from 'discord-api-types/v10'
import type { ForumChannel, TextChannel } from 'discord.js'

export async function fetchHelpChannels(guildId: string): Promise<string[]> {
  let channels: string[] = []

  try {
    // @todo remove typecast
    const allChannels = (await api.get(
      Routes.guildChannels(guildId)
    )) as APIPartialChannel[]
    if (allChannels?.length) {
      // @todo remove typecast
      channels = allChannels
        .filter((channel: APIPartialChannel) =>
          isHelpChannel(channel as TextChannel | ForumChannel)
        )
        .map((channel) => channel.name) as string[]
    }
  } catch (cause) {
    throw new Error(`Error fetching guild channels for guild ${guildId}`, {
      cause,
    })
  }

  return channels
}
