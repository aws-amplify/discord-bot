import { Routes } from 'discord.js'
import { api } from './api'
import type { APIGuild } from 'discord.js'

/**
 * Fetches the bot's guilds
 */
export async function getBotGuilds() {
  return api.get(Routes.userGuilds()) as Promise<APIGuild[]>
}
