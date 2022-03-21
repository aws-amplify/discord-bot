// @ts-ignore
import { bank } from '@hey-amplify/bank'
import { createAPI } from './api.js'

export async function registerCommand(
  command,
  { guildId } = { guildId: null }
) {
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
  // @ts-ignore
  const commands = Array.from(bank.values()).map(registerCommand)
  let result = [] as any
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
  const registeredCommands = await api.get(
    `/applications/${process.env.DISCORD_APP_ID}/commands`
  )
  const banked = Array.from(bank.values()).map((command: any) => command.config)
  let commands = [] as any
  for (let command of banked) {
    const registered = registeredCommands.data.find(
      (c) => c.name === command.name
    )
    if (registered) {
      command.registration = registered
    }
    commands.push(command)
  }
  return commands
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
