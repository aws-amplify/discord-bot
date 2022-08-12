import * as admin from './commands/admin'
import * as contribute from './commands/contribute'
import * as github from './commands/github'
import * as giverole from './commands/giverole'
import * as login from './commands/login'
import * as selectAnswer from './commands/select-answer'
import * as thread from './commands/thread'
import * as q from './commands/q'
import { api } from './api'
import { Routes } from 'discord-api-types/v10'
import type {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from '@discordjs/builders'
import type { RESTPostAPIApplicationCommandsResult } from 'discord-api-types/v10'
import type {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  InteractionReplyOptions,
} from 'discord.js'

export type Command = {
  name: string
  description: string
  config: SlashCommandBuilder | ContextMenuCommandBuilder
  handle: (
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
  ) => Promise<InteractionReplyOptions | string | undefined | void>
}

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
          if (response) {
            if (interaction.deferred) {
              return await interaction.editReply(response)
            }
            return await interaction.reply(response)
          }
        } catch (error) {
          console.error(
            `Error handling command ${command.config.name} for ${interaction.user.id}:`,
            error
          )
          if (interaction.deferred) {
            return await interaction.editReply({
              content: somethingWentWrongResponse,
            })
          } else {
            return await interaction.reply({
              ephemeral: true,
              content: somethingWentWrongResponse,
            })
          }
        }
        if (!interaction.replied) {
          // should not make it here...
          if (interaction.deferred) {
            await interaction.editReply({
              content: somethingWentWrongResponse,
            })
          } else {
            await interaction.reply({
              ephemeral: true,
              content: somethingWentWrongResponse,
            })
          }
        }
      },
    }
    map.set(command.config.name, stored)
  }
  return map
}

export const commands = createCommandsMap([
  admin,
  contribute,
  github,
  giverole,
  login,
  selectAnswer,
  thread,
  q,
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
