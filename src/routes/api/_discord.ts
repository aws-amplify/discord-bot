import { createDiscordApi } from '$discord'

export const api = createDiscordApi(process.env.DISCORD_BOT_TOKEN)
