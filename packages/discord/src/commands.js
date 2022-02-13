import { bank } from '@hey-amplify/bank'
import { createAPI } from './api.js'

export async function registerCommand(command, { guildId } = {}) {
  const api = createAPI(process.env.DISCORD_BOT_TOKEN)

  let url = `/applications/${process.env.DISCORD_APP_ID}`
  if (guildId) {
    url += `/guilds/${guildId}`
  }
  url += '/commands'

  // TODO: add whether command was added or updated based on status
  return api.post(url, command.config)
}

export async function syncCommands() {
  const commands = Array.from(bank.values()).map(registerCommand)
  let result = []
  for await (let registered of commands) {
    if (registered.error) {
      console.error(
        `Error registering command ${registered.error.name}:`,
        registered.error
      )
    } else {
      result.push(registered.data)
    }
  }
  if (!result.length) {
    throw new Error('No commands registered')
  }
  return result
}

export async function listCommands() {
  const api = createAPI()
  const registered = await api.get(
    `/applications/${process.env.DISCORD_APP_ID}/commands`
  )
  const banked = Array.from(bank.values()).map((command) => command.config)
  console.log({ registered: registered.data, banked })
  // TODO: compare registered and banked commands and return all (isRegistered, isBanked)
}

export async function deleteCommand(commandId, { guildId }) {
  const api = createAPI(process.env.DISCORD_BOT_TOKEN)

  let url = `/applications/${process.env.DISCORD_APP_ID}`
  if (guildId) {
    url += `/guilds/${guildId}`
  }
  url += `/commands/${commandId}`

  return api.delete(url)
}
