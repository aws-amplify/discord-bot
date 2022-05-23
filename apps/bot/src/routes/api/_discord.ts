import { createDiscordApi } from '@hey-amplify/discord'

export const api = createDiscordApi(process.env.DISCORD_BOT_TOKEN)
