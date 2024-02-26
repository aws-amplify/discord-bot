import type { APIGuild } from 'discord.js'
import { Routes } from 'discord.js'
import { api } from './api'

/**
 * Fetches the bot's guilds
 */
export async function getBotGuilds() {
  return api.get(Routes.userGuilds()) as Promise<APIGuild[]>
}
