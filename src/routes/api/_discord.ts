import { createDiscordApi } from './../../lib/discord'

export const api = createDiscordApi(process.env.DISCORD_BOT_TOKEN)
