import * as admin from './commands/admin'
import * as contribute from './commands/contribute'
import * as github from './commands/github'
import * as giverole from './commands/giverole'
import * as login from './commands/login'
import * as selectAnswer from './commands/select-answer'
import * as thread from './commands/thread'
import * as q from './commands/q'
import { api } from './api'
import {
  Routes,
  type RESTPostAPIApplicationGuildCommandsResult,
} from 'discord-api-types/v10'
import type {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from '@discordjs/builders'
import type {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  InteractionReplyOptions,
} from 'discord.js'

export type Command = {
  name: string
  code: string
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
      code: `COMMAND_${command.config.name.replace('-', '').toUpperCase()}`,
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

export const features = Array.from(commands.values()).map((c) => ({
  code: c.code,
  name: c.name,
  description: c.description || `Command ${c.name}`,
}))

const c = commands

export async function registerCommands(
  commands: Command[] = Array.from(c.values()),
  guild: string
): Promise<RESTPostAPIApplicationGuildCommandsResult | undefined> {
  const payload = commands.map((c) => c.config.toJSON())

  let response
  try {
    console.log(`Started refreshing guild slash (/) commands for ${guild}.`)
    response = (await api.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APP_ID as string,
        guild
      ),
      payload
    )) as RESTPostAPIApplicationGuildCommandsResult
    console.log(
      `Successfully refreshing guild slash (/) commands for ${guild}.`
    )
  } catch (error) {
    console.error(
      `Error refreshing guild slash (/) commands for ${guild}`,
      error
    )
    throw new Error('Error registering commands')
  }
  return response
}

export async function registerCommand(
  command: Command,
  guild: string
): Promise<RESTPostAPIApplicationGuildCommandsResult | undefined> {
  // const payload = command.config.toJSON()
  const payload = command.config.toJSON()
  let response
  const messaging = `registering guild slash (/) command ${command.name} for ${guild}.`
  try {
    console.log(`Started ${messaging}`)
    response = (await api.post(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APP_ID as string,
        guild
      ),
      payload
    )) as RESTPostAPIApplicationGuildCommandsResult
    console.log(`Successfully ${messaging}`)
  } catch (error) {
    console.error(`Error ${messaging}`, error)
    throw new Error(`Error ${messaging}`)
  }
  return response
}
