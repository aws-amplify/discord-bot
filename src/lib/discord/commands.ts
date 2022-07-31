import * as contribute from './commands/contribute'
import * as github from './commands/github'
import * as giverole from './commands/giverole'
import * as selectAnswer from './commands/select-answer'
import * as thread from './commands/thread'
import { api } from './api'
import { Routes } from 'discord-api-types/v10'
import type { RESTPostAPIApplicationCommandsResult } from 'discord-api-types/v10'
import type {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
} from 'discord.js'

function createCommandsMap(commands: any[]) {
  const map = new Map()
  for (const command of commands) {
    const stored = {
      name: command.config.name,
      description: command.config?.description,
      config: command.config,
      _handler: command.handler,
      handle: async (
        interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
      ) => {
        const somethingWentWrongResponse = '🤕 Something went wrong'
        try {
          const response = await command.handler(interaction)
          if (response) return await interaction.reply(response)
        } catch (error) {
          console.error(
            `Error handling command ${command.config.name} for ${interaction.user.id}:`,
            error
          )
          return await interaction.reply(somethingWentWrongResponse)
        }
        if (!interaction.replied) {
          // should not make it here...
          await interaction.reply(somethingWentWrongResponse)
        }
      },
    }
    map.set(command.config.name, stored)
  }
  return map
}

export const commands = createCommandsMap([
  contribute,
  github,
  giverole,
  selectAnswer,
  thread,
])

const c = commands
export async function registerCommands(
  commands: Map<string, any> = c
): Promise<RESTPostAPIApplicationCommandsResult[] | undefined> {
  const payload = Array.from(commands.values()).map((c) => c.config.toJSON())
  let response
  try {
    console.log('Started refreshing application (/) commands.')
    response = (await api.put(
      Routes.applicationCommands(process.env.DISCORD_APP_ID as string),
      payload
    )) as RESTPostAPIApplicationCommandsResult[]
    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error('Error registering commands', error)
    throw new Error('Error registering commands')
  }
  return response
}
