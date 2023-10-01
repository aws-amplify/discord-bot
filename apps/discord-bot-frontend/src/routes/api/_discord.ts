import { createDiscordApi } from '$discord/api'

export const api = createDiscordApi(process.env.DISCORD_BOT_TOKEN)
