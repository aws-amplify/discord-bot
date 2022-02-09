import { createAPI } from './api.js'

export async function registerCommandV(command, { guildId } = {}) {
  const api = createAPI(process.env.DISCORD_BOT_TOKEN)

  let url = `/applications/${process.env.DISCORD_APP_ID}`
  if (guildId) {
    url += `/guilds/${guildId}`
  }
  url += '/commands'

  return api.post(url, command.config)
}
